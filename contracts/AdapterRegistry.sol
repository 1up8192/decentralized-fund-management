pragma solidity ^0.5.6;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AdapterRegistry is Ownable {
    mapping (bytes32 => address) private adapterRegistry;

    event DexAdded(bytes32 indexed name, address adapterAddress);
    event DexRemoved(bytes32 indexed name);

    constructor (bytes32[] memory names, address[] memory adapterAddresses) public {
        require(names.length == adapterAddresses.length,  "constructor(...): Error, names and adapterAddresses has different lenghts");
        for(uint i = 0; i < names.length; i++){
            adapterRegistry[names[i]] = adapterAddresses[i];
            emit DexAdded(names[i], adapterAddresses[i]);
        }
    }

    function addDex(bytes32 name, address adapterAddress) public onlyOwner {
        adapterRegistry[name] = adapterAddress;
        emit DexAdded(name, adapterAddress);
    }

    function removeDex(bytes32 name) public onlyOwner {
        delete adapterRegistry[name];
        emit DexRemoved(name);
    }

    function getAdapterAddress(bytes32 name) public view returns (address){
        return adapterRegistry[name];
    }
}