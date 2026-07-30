// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { MelegaFixedSupplyToken } from "./MelegaFixedSupplyToken.sol";

/**
 * @title MelegaTokenFactory
 * @notice Immutable factory that deploys MelegaFixedSupplyToken and forwards creation fees
 *         immediately to the canonical MELEGA TREASURY WALLET.
 * @dev Factory does not custody token supply, does not retain token ownership,
 *      and cannot mint or alter deployed token behavior after creation.
 */
contract MelegaTokenFactory {
    address public immutable feeRecipient;
    uint256 public immutable creationFee;

    uint256 public constant MAX_NAME_BYTES = 64;
    uint256 public constant MAX_SYMBOL_BYTES = 16;
    uint8 public constant MAX_DECIMALS = 18;
    /// @dev Upper bound on raw total supply units (prevents absurd constructor inputs).
    uint256 public constant MAX_TOTAL_SUPPLY = 1e36;

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

    error ZeroFeeRecipient();
    error IncorrectCreationFee(uint256 expected, uint256 provided);
    error EmptyName();
    error NameTooLong(uint256 length);
    error EmptySymbol();
    error SymbolTooLong(uint256 length);
    error ZeroOwner();
    error ZeroSupply();
    error SupplyTooLarge(uint256 supply);
    error DecimalsTooHigh(uint8 decimals_);
    error FeeForwardFailed();

    constructor(address feeRecipient_, uint256 creationFee_) {
        if (feeRecipient_ == address(0)) revert ZeroFeeRecipient();
        feeRecipient = feeRecipient_;
        creationFee = creationFee_;
    }

    /**
     * @notice Deploy a fixed-supply token. Entire supply is minted to `owner`.
     * @param name_ Token name (1..64 bytes)
     * @param symbol_ Token symbol (1..16 bytes)
     * @param totalSupply_ Raw total supply in base units (must be > 0 and <= MAX_TOTAL_SUPPLY)
     * @param decimals_ Token decimals (0..18)
     * @param owner Recipient of the full initial supply (non-zero)
     */
    function createToken(
        string calldata name_,
        string calldata symbol_,
        uint256 totalSupply_,
        uint8 decimals_,
        address owner
    ) external payable returns (address token) {
        if (msg.value != creationFee) revert IncorrectCreationFee(creationFee, msg.value);

        uint256 nameLen = bytes(name_).length;
        if (nameLen == 0) revert EmptyName();
        if (nameLen > MAX_NAME_BYTES) revert NameTooLong(nameLen);

        uint256 symbolLen = bytes(symbol_).length;
        if (symbolLen == 0) revert EmptySymbol();
        if (symbolLen > MAX_SYMBOL_BYTES) revert SymbolTooLong(symbolLen);

        if (owner == address(0)) revert ZeroOwner();
        if (totalSupply_ == 0) revert ZeroSupply();
        if (totalSupply_ > MAX_TOTAL_SUPPLY) revert SupplyTooLarge(totalSupply_);
        if (decimals_ > MAX_DECIMALS) revert DecimalsTooHigh(decimals_);

        token = address(new MelegaFixedSupplyToken(name_, symbol_, decimals_, totalSupply_, owner));

        if (creationFee > 0) {
            (bool ok,) = feeRecipient.call{ value: msg.value }("");
            if (!ok) revert FeeForwardFailed();
        }

        emit TokenCreated(
            msg.sender,
            token,
            name_,
            symbol_,
            totalSupply_,
            decimals_,
            owner,
            creationFee,
            block.timestamp
        );
    }
}
