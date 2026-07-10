// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Constitutional execution surface — Wrapper delegates swap execution only.
/// @dev Adapters must not implement pricing, treasury, settlement, referral, or waterfall logic.
interface IExecutionAdapter {
    enum RouterType {
        V2,
        SMART_ROUTER
    }

    function executeExactInput(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amountOut);

    function executeNativeInput(
        uint256 amountOutMin,
        address[] calldata path,
        address recipient,
        uint256 deadline
    ) external payable returns (uint256 amountOut);

    function quote(uint256 amountIn, address[] calldata path) external view returns (uint256 amountOut);

    /// @notice Constitutional surface name: supports()
    function supportsExecution(address tokenIn, address tokenOut, bool exactInput) external view returns (bool);

    function routerType() external view returns (RouterType routerType_);

    function routerAddress() external view returns (address routerAddress_);
}
