pragma solidity ^0.4.18;

contract ExchangeIndex {

    address owner;

    mapping (string => address) exchangeInterfaceAddresses;
    string[] exchangeNames;

    function ExchangeIndex() public{
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    function addExchange(string name, address exchangeInterfaceAddress) public onlyOwner{
        exchangeInterfaceAddresses[name] = exchangeInterfaceAddress;
        exchangeNames.push(name);
    }

    function removeExchange(string name) public onlyOwner{
        delete exchangeInterfaceAddresses[name];
        bool removed = false;
        for (uint i=0; i < exchangeNames.length; i++){
            if(removed){
                exchangeNames[i-1] = exchangeNames[i];
            }
            if (keccak256(exchangeNames[i]) == keccak256(name)){
                delete exchangeNames[i];
                removed= true;
            }
        }
        if(removed) exchangeNames.length -= 1;
    }

}
