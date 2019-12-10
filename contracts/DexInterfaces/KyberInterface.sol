pragma solidity ^0.5.6;

import '../../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// @title Kyber Network proxy for main contract Interface
/// modified from: https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/KyberNetworkProxy.sol
/// documentation: https://developer.kyber.network/docs/KyberNetworkProxy/
interface KyberInterface {

    /// @notice use token address ETH_TOKEN_ADDRESS for ether
    /// @dev makes a trade between src and dest token and send dest token to destAddress
    /// @param src Src token
    /// @param srcAmount amount of src tokens
    /// @param dest   Destination token
    /// @param destAddress Address to send tokens to
    /// @param maxDestAmount A limit on the amount of dest tokens
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @param walletId is the wallet ID to send part of the fees
    /// @return amount of actual dest tokens
    function trade(
        IERC20 src,
        uint srcAmount,
        IERC20 dest,
        address destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId
    )
        external
        payable
        returns(uint);

    /// @dev makes a trade between src and dest token and send dest tokens to msg sender
    /// @param src Src token
    /// @param srcAmount amount of src tokens
    /// @param dest Destination token
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @return amount of actual dest tokens
    function swapTokenToToken(
        IERC20 src,
        uint srcAmount,
        IERC20 dest,
        uint minConversionRate
    )
        external
        returns(uint);

    /// @dev makes a trade from Ether to token. Sends token to msg sender
    /// @param token Destination token
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @return amount of actual dest tokens
    function swapEtherToToken(IERC20 token, uint minConversionRate) external payable returns(uint);

    /// @dev makes a trade from token to Ether, sends Ether to msg sender
    /// @param token Src token
    /// @param srcAmount amount of src tokens
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @return amount of actual dest tokens
    function swapTokenToEther(IERC20 token, uint srcAmount, uint minConversionRate) external returns(uint);

    event ExecuteTrade(address indexed trader, IERC20 src, IERC20 dest, uint actualSrcAmount, uint actualDestAmount);

    /// @notice use token address ETH_TOKEN_ADDRESS for ether
    /// @dev makes a trade between src and dest token and send dest token to destAddress
    /// @param src Src token
    /// @param srcAmount amount of src tokens
    /// @param dest Destination token
    /// @param destAddress Address to send tokens to
    /// @param maxDestAmount A limit on the amount of dest tokens
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @param walletId is the wallet ID to send part of the fees
    /// @param hint will give hints for the trade.
    /// @return amount of actual dest tokens
    function tradeWithHint(
        IERC20 src,
        uint srcAmount,
        IERC20 dest,
        address destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId,
        bytes calldata hint
    )
        external
        payable
        returns(uint);

    event KyberNetworkSet(address newNetworkContract, address oldNetworkContract);

    function getExpectedRate(IERC20 src, IERC20 dest, uint srcQty)
        external view
        returns(uint expectedRate, uint slippageRate);

    function getUserCapInWei(address user) external view returns(uint);

    function getUserCapInTokenWei(address user, IERC20 token) external view returns(uint);

    function maxGasPrice() external view returns(uint);

    function enabled() external view returns(bool);

    function info(bytes32 field) external view returns(uint);

}