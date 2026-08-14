// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { MelegaTokenFactory } from "../../contracts/create-token/MelegaTokenFactory.sol";
import { MelegaFixedSupplyToken } from "../../contracts/create-token/MelegaFixedSupplyToken.sol";

contract RejectEther {
    fallback() external payable {
        revert("no");
    }

    receive() external payable {
        revert("no");
    }
}

contract MelegaTokenFactoryTest is Test {
    address constant TREASURY = address(0xB643);

    MelegaTokenFactory internal factory;
    uint256 internal constant FEE = 0.01 ether;

    event TokenCreated(
        address indexed creator,
        address indexed token,
        string name,
        string symbol,
        uint256 totalSupply,
        uint8 decimals,
        address owner,
        uint256 creationFee,
        uint256 timestamp
    );

    function setUp() public {
        factory = new MelegaTokenFactory(TREASURY, FEE);
    }

    function test_constructorSetsImmutableFeeModel() public view {
        assertEq(factory.feeRecipient(), TREASURY);
        assertEq(factory.creationFee(), FEE);
    }

    function test_createToken_mintsFullSupplyToOwner_andForwardsFee() public {
        address creator = address(0xC0FFEE);
        address owner = address(0xA11CE);
        vm.deal(creator, 1 ether);

        uint256 supply = 1_000_000 ether;
        vm.expectEmit(true, false, false, true);
        emit TokenCreated(creator, address(0), "Alpha", "ALP", supply, 18, owner, FEE, block.timestamp);

        vm.prank(creator);
        address token = factory.createToken{ value: FEE }("Alpha", "ALP", supply, 18, owner);

        MelegaFixedSupplyToken t = MelegaFixedSupplyToken(token);
        assertEq(t.name(), "Alpha");
        assertEq(t.symbol(), "ALP");
        assertEq(t.decimals(), 18);
        assertEq(t.totalSupply(), supply);
        assertEq(t.balanceOf(owner), supply);
        assertEq(t.balanceOf(address(factory)), 0);
        assertEq(address(factory).balance, 0);
        assertEq(TREASURY.balance, FEE);
    }

    function test_localE2E_threeDistinctTokens() public {
        address a = address(0x1);
        address b = address(0x2);
        address c = address(0x3);
        vm.deal(a, 1 ether);
        vm.deal(b, 1 ether);
        vm.deal(c, 1 ether);

        vm.prank(a);
        address t1 = factory.createToken{ value: FEE }("One", "ONE", 100 ether, 18, a);
        vm.prank(b);
        address t2 = factory.createToken{ value: FEE }("Two", "TWO", 200e6, 6, b);
        vm.prank(c);
        address t3 = factory.createToken{ value: FEE }("Three", "THR", 3 ether, 18, address(0x99));

        assertTrue(t1 != t2 && t2 != t3 && t1 != t3);
        assertEq(MelegaFixedSupplyToken(t1).balanceOf(a), 100 ether);
        assertEq(MelegaFixedSupplyToken(t2).balanceOf(b), 200e6);
        assertEq(MelegaFixedSupplyToken(t2).decimals(), 6);
        assertEq(MelegaFixedSupplyToken(t3).balanceOf(address(0x99)), 3 ether);
        assertEq(address(factory).balance, 0);
        assertEq(TREASURY.balance, FEE * 3);
    }

    function test_noPostDeploymentMintSelector() public {
        address token = _createDefault();
        // mint(address,uint256) selector must not exist as a successful external call path
        (bool ok,) = token.call(abi.encodeWithSignature("mint(address,uint256)", address(this), 1));
        assertFalse(ok);
    }

    function test_noPauseBlacklistTaxControls() public {
        address token = _createDefault();
        (bool pauseOk,) = token.call(abi.encodeWithSignature("pause()"));
        (bool blacklistOk,) = token.call(abi.encodeWithSignature("blacklist(address)", address(1)));
        (bool taxOk,) = token.call(abi.encodeWithSignature("setTax(uint256)", 100));
        assertFalse(pauseOk);
        assertFalse(blacklistOk);
        assertFalse(taxOk);
    }

    function test_revertIncorrectFee() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert(
            abi.encodeWithSelector(MelegaTokenFactory.IncorrectCreationFee.selector, FEE, uint256(0))
        );
        factory.createToken("X", "X", 1 ether, 18, address(this));
    }

    function test_revertZeroOwner() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert(MelegaTokenFactory.ZeroOwner.selector);
        factory.createToken{ value: FEE }("X", "X", 1 ether, 18, address(0));
    }

    function test_revertZeroSupply() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert(MelegaTokenFactory.ZeroSupply.selector);
        factory.createToken{ value: FEE }("X", "X", 0, 18, address(this));
    }

    function test_revertSupplyTooLarge() public {
        vm.deal(address(this), 1 ether);
        uint256 tooLarge = uint256(1e36) + 1;
        vm.expectRevert(abi.encodeWithSelector(MelegaTokenFactory.SupplyTooLarge.selector, tooLarge));
        factory.createToken{ value: FEE }("X", "X", tooLarge, 18, address(this));
    }

    function test_revertDecimalsTooHigh() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert(abi.encodeWithSelector(MelegaTokenFactory.DecimalsTooHigh.selector, uint8(19)));
        factory.createToken{ value: FEE }("X", "X", 1 ether, 19, address(this));
    }

    function test_revertEmptyNameAndSymbol() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert(MelegaTokenFactory.EmptyName.selector);
        factory.createToken{ value: FEE }("", "X", 1 ether, 18, address(this));
        vm.expectRevert(MelegaTokenFactory.EmptySymbol.selector);
        factory.createToken{ value: FEE }("X", "", 1 ether, 18, address(this));
    }

    function test_revertOversizedStrings() public {
        vm.deal(address(this), 1 ether);
        string memory longName = _repeat("a", 65);
        string memory longSymbol = _repeat("b", 17);
        vm.expectRevert(abi.encodeWithSelector(MelegaTokenFactory.NameTooLong.selector, uint256(65)));
        factory.createToken{ value: FEE }(longName, "X", 1 ether, 18, address(this));
        vm.expectRevert(abi.encodeWithSelector(MelegaTokenFactory.SymbolTooLong.selector, uint256(17)));
        factory.createToken{ value: FEE }("X", longSymbol, 1 ether, 18, address(this));
    }

    function test_revertFeeForwardFailure() public {
        RejectEther rejector = new RejectEther();
        MelegaTokenFactory f = new MelegaTokenFactory(address(rejector), FEE);
        vm.deal(address(this), 1 ether);
        vm.expectRevert(MelegaTokenFactory.FeeForwardFailed.selector);
        f.createToken{ value: FEE }("X", "X", 1 ether, 18, address(this));
    }

    function test_zeroFeeFactoryAllowedForLocal() public {
        MelegaTokenFactory f = new MelegaTokenFactory(TREASURY, 0);
        address token = f.createToken("Z", "Z", 1 ether, 18, address(0xABC));
        assertEq(MelegaFixedSupplyToken(token).balanceOf(address(0xABC)), 1 ether);
        assertEq(address(f).balance, 0);
    }

    function test_duplicateNamesSymbolsAllowed_distinctAddresses() public {
        vm.deal(address(this), 1 ether);
        address t1 = factory.createToken{ value: FEE }("Same", "SAM", 1 ether, 18, address(this));
        address t2 = factory.createToken{ value: FEE }("Same", "SAM", 1 ether, 18, address(this));
        assertTrue(t1 != t2);
    }

    function test_erc20TransferWorks() public {
        address token = _createDefault();
        MelegaFixedSupplyToken t = MelegaFixedSupplyToken(token);
        vm.prank(address(this));
        // owner is address(this) from _createDefault
        t.transfer(address(0xBEEF), 1 ether);
        assertEq(t.balanceOf(address(0xBEEF)), 1 ether);
    }

    function _createDefault() internal returns (address token) {
        vm.deal(address(this), 1 ether);
        token = factory.createToken{ value: FEE }("Default", "DEF", 1000 ether, 18, address(this));
    }

    function _repeat(string memory ch, uint256 n) internal pure returns (string memory) {
        bytes memory b = new bytes(n);
        bytes memory c = bytes(ch);
        for (uint256 i = 0; i < n; i++) {
            b[i] = c[0];
        }
        return string(b);
    }
}
