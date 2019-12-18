pragma solidity ^0.5.6;

import '../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './Fund.sol';


contract FundFactory is Ownable {

    mapping(address => bool) public funds;
    
    event fundCreated(address fundAddress);

    address public adapterRegistry; //todo clean up
    address public orders;

    constructor (address _adapterRegistry) public {
        adapterRegistry = _adapterRegistry;
    }

    function setUpContractInstances (address _orders) public onlyOwner {
        orders = _orders;
    }

    function createFund(
        uint32 _startTime,
        uint32 _endTime,
        uint _globalTraderLimit,
        uint _investMin,
        uint _investMax,
        address[] memory traderAddresses,
        uint[] memory traderLimits
    ) public returns (address) {
        Fund fund = new Fund(
            msg.sender, // portfolioManager
            orders,
            adapterRegistry,
            _endTime,
            false
        );
        emit fundCreated(address(fund));
        return address(fund);
    }

    function isFund(address fundAddress) public view returns(bool){
        return funds[fundAddress];
    }


}