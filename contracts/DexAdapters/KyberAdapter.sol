pragma solidity ^0.5.6;

import "../DexInterfaces/KyberInterface.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AbstractAdapter.sol";

contract KyberAdapter is AbstractAdapter {

    constructor (address _dexAddress, bool _enabled) AbstractAdapter(_dexAddress, _enabled) public {}

    function makeOrder(address _dexAddress, address tokenToSell, uint amountToSell, address tokenToBuy, uint rate) public returns (uint){
        if(tokenToSell == ETH_ADDRESS) {
            /// @dev makes a trade from Ether to token. Sends token to msg sender
            /// @param token Destination token
            /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
            /// @return amount of actual dest tokens
            KyberInterface(_dexAddress).swapEtherToToken.value(amountToSell)(IERC20(tokenToBuy), rate);
        } else if(tokenToBuy == ETH_ADDRESS) {
            /// @dev makes a trade from token to Ether, sends Ether to msg sender
            /// @param token Src token
            /// @param srcAmount amount of src tokens
            /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
            /// @return amount of actual dest tokens
            KyberInterface(_dexAddress).swapTokenToEther(IERC20(tokenToSell), amountToSell, rate);
        } else {
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
            KyberInterface(_dexAddress).trade(IERC20(tokenToSell), amountToSell, IERC20(tokenToBuy), msg.sender, 0, rate, address(0));
        }
        return 0;
    }

    function takeOrder(address _dexAddress, address tokenToSell, uint256 amountToSell, address tokenToBuy) external returns (uint){
        uint amount;
        if(tokenToSell == ETH_ADDRESS) {
            /// @dev makes a trade from Ether to token. Sends token to msg sender
            /// @param token Destination token
            /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
            /// @return amount of actual dest tokens
            amount = KyberInterface(_dexAddress).swapEtherToToken.value(amountToSell)(IERC20(tokenToBuy), 0);
        } else if(tokenToBuy == ETH_ADDRESS) {
            /// @dev makes a trade from token to Ether, sends Ether to msg sender
            /// @param token Src token
            /// @param srcAmount amount of src tokens
            /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
            /// @return amount of actual dest tokens
            amount = KyberInterface(_dexAddress).swapTokenToEther(IERC20(tokenToSell), amountToSell,  0);
        } else {
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
            amount = KyberInterface(_dexAddress).trade(IERC20(tokenToSell), amountToSell, IERC20(tokenToBuy), msg.sender, 0, 0, address(0));
        }
        return amount;
    }

    function getRate(address tokenToSell, uint amountToSell, address tokenToBuy) public view returns (uint) {
        address tokenToSellConverted = tokenToSell;
        address tokenToBuyConverted = tokenToBuy;
        if(tokenToSell == ETH_ADDRESS) tokenToSellConverted = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        if(tokenToBuy == ETH_ADDRESS) tokenToBuyConverted = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        (uint expectedRate, ) = KyberInterface(dexAddress).getExpectedRate(IERC20(tokenToSellConverted), IERC20(tokenToBuyConverted), amountToSell);
        return expectedRate;
    }

}
