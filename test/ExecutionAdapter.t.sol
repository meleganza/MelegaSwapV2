// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {V2ExecutionAdapter} from "../contracts/adapters/V2ExecutionAdapter.sol";
import {SmartRouterExecutionAdapter} from "../contracts/adapters/SmartRouterExecutionAdapter.sol";
import {MockUnderlyingSwapRouter} from "../contracts/mocks/MockUnderlyingSwapRouter.sol";
import {IExecutionAdapter} from "../contracts/interfaces/IExecutionAdapter.sol";

contract ExecutionAdapterTest is Test {
    MockUnderlyingSwapRouter internal mockV2;
    V2ExecutionAdapter internal v2Adapter;

    function setUp() public {
        mockV2 = new MockUnderlyingSwapRouter();
        v2Adapter = new V2ExecutionAdapter(address(mockV2));
    }

    function test_v2AdapterRouterTypeAndAddress() public view {
        assertEq(uint256(v2Adapter.routerType()), uint256(IExecutionAdapter.RouterType.V2));
        assertEq(v2Adapter.routerAddress(), address(mockV2));
    }

    function test_v2AdapterImplementsUnderlyingSwapRouter() public {
        assertTrue(v2Adapter.supportsExecution(address(1), address(2), true));
        assertFalse(v2Adapter.supportsExecution(address(1), address(2), false));
    }

    function test_smartRouterAdapterRouterType() public {
        SmartRouterExecutionAdapter smart = new SmartRouterExecutionAdapter(address(0xBEEF));
        assertEq(uint256(smart.routerType()), uint256(IExecutionAdapter.RouterType.SMART_ROUTER));
        assertEq(smart.routerAddress(), address(0xBEEF));
    }

    function test_smartRouterQuoteReverts() public {
        SmartRouterExecutionAdapter smart = new SmartRouterExecutionAdapter(address(0xBEEF));
        address[] memory path = new address[](2);
        path[0] = address(1);
        path[1] = address(2);
        vm.expectRevert(SmartRouterExecutionAdapter.QuoteUnsupported.selector);
        smart.quote(1 ether, path);
    }
}
