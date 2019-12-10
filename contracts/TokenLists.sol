pragma solidity ^0.5.6;

import './FundFactory.sol';
import '../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenLists is Ownable{

    struct Lists{
        mapping(address => bool) white; // (token address => is on the list?)
        mapping(address => bool) black; //(token address => is on the list?)
    }

    address public fundFactoryAddress;

    modifier onlyFund {
        require(FundFactory(fundFactoryAddress).isFund(msg.sender), "modifier onlyFund");
        _;
    }

    mapping(address => Lists) fundLists;
    mapping(uint16 => Lists) globalLists;

    uint16 private idCount;

    constructor(address _fundFactoryAddress) public{
        fundFactoryAddress = _fundFactoryAddress;
    }

    function addFundList(address[] memory white, address[] memory black) public onlyFund {
        Lists storage lists = fundLists[msg.sender];
        addItems(lists, white, black);
    }

    function addGlobalList(address[] memory white, address[] memory black) public onlyOwner {
        Lists storage lists = globalLists[idCount];
        addItems(lists, white, black);
        idCount++;
    }

    function addItemsFundList(address[] memory white, address[] memory black) public onlyFund {
        addFundList(white, black);
    }

    function removeItemsFundList(address[] memory white, address[] memory black) public onlyFund {
        Lists storage lists = fundLists[msg.sender];
        removeItems(lists, white, black);
    }

    function addItemsGlobalList(uint16 listId, address[] memory white, address[] memory black) public onlyOwner {
        Lists storage lists = globalLists[listId];
        addItems(lists, white, black);
    }

    function removeItemsGlobalList(uint16 listId, address[] memory white, address[] memory black) public onlyOwner {
        Lists storage lists = globalLists[listId];
        removeItems(lists, white, black);
    }

    function addItems(Lists storage lists, address[] memory white, address[] memory black) private {
        for(uint i = 0; i < white.length; i++) {
            require(!lists.black[black[i]], "addItems - black/white collision");
            lists.white[white[i]] = true;
        }
        for(uint i = 0; i < black.length; i++) {
            require(!lists.white[white[i]], "addItems - black/white collision");
            lists.black[black[i]] = true;
        }
    }

    function removeItems(Lists storage lists, address[] memory white, address[] memory black) private {
        for(uint i = 0; i < white.length; i++) {
            lists.white[white[i]] = false;
        }
        for(uint i = 0; i < black.length; i++) {
            lists.black[black[i]] = false;
        }
    }
}