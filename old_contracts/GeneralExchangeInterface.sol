pragma solidity ^0.4.18;


interface ExchangeInterface {
    
    function submitOrder(address tokenAddressToGive, uint tokenAtomValueToGive, address tokenAddressToGet, uint tokenAtomValueToGet) public returns (bytes32 OrderID);
    
    function checkOrderStatus(bytes32 orderID) public returns (uint8 status);
    
    function cancelOrder(bytes32 orderID) public;
    
}
