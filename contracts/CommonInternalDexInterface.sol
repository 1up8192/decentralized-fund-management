pragma solidity ^0.5.6;

interface CommonInternalDexInterface {
    function makeOrder(address dexAddress, address tokenToSell, uint amountToSell, address tokenToBuy, uint rate) external returns (uint);
    function takeOrder(address dexAddress, address tokenToSell, uint256 amountToSell, address tokenToBuy) external returns (uint);
    function getRate(address tokenToSell, uint amountToSell, address tokenToBuy) external view returns (uint);
}