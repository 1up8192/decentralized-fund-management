pragma solidity ^0.5.6;

import './Orders.sol';
import './CommonInternalDexInterface.sol';
import './DexAdapters/AbstractAdapter.sol';
import './AdapterRegistry.sol';
import './DexAdapters/KyberAdapter.sol';
import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';
import '../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './utils/BytesLib.sol';

contract Fund {

    struct Params {
        address adapterRegistryContract;
        address ordersContract;
        address portfolioManager;
    }

    struct States {
        bytes32 latestUnverifiedTrade;
        //[] tokensOwnedList; //token addresses ____ kell?
    }

    struct FundRules {
        uint24 profitToInvestor; //todo 100000 = 100%, 1000 = 1%, 1 = 0.001%
        uint24 stopLossPercent; //todo 100000 = 100%, 1000 = 1%, 1 = 0.001%
        uint32 endTime;
        bool openEnded;
    }

    Params public params;
    States public states;
    FundRules public fundRules;

    address constant DEFAULT_TOKEN = 0x0000000000000000000000000000000000000000; //Ether
    uint256 constant UINT256_MAX = ~uint256(0);


    mapping(address => uint) public investments; //investor => amount

    event newInvestment(address investor, uint amount);
    event newWithdrawal(address investor, uint amount);
    event newOrder(bytes32 orderId);
    event stopLossTriggered();
    event fundClosed();
    event delegateResult(bool success, bytes result);


    modifier onlyPM {
        require(params.portfolioManager == msg.sender, "modifier onlyPM");
        _;
    }

    constructor (
        address _portfolioManager,
        address _orders,
        address _adapterRegistry,
        uint32 _endTime,
        bool _openEnded
    ) public {
        require(now < _endTime, "now > endTime");
        params.portfolioManager = _portfolioManager;
        params.ordersContract = _orders;
        params.adapterRegistryContract = _adapterRegistry;
        fundRules.endTime = _endTime;
        fundRules.openEnded = _openEnded;
    }

    //fallback to be able to be paid
    function() external payable { }

    function invest() public payable {
        require(now < fundRules.endTime, "invest - fund has ended");
        require(msg.value > 0, "invest - contribution is lower than limit");
        investments[msg.sender] += msg.value;
        emit newInvestment(msg.sender, msg.value);
    }

    function withdraw() public {

    }

    function triggerFundStopLoss() public {

    }

    function triggerOrderStopLoss(bytes memory orderId) public {

    }

    function openOrder(uint amountToPay, uint amountToBuy, address tokenToBuy, bytes32 dex) public {
        address adapterAddress = AdapterRegistry(params.adapterRegistryContract).getAdapterAddress(dex);
        require(fundRules.endTime > now, "fund has ended");
        address dexAddress = AbstractAdapter(adapterAddress).dexAddress();

        bytes32 orderId = Orders(params.ordersContract).addNewOrder(
            amountToPay,
            amountToBuy,
            0, //stop loss todo
            DEFAULT_TOKEN,
            tokenToBuy,
            msg.sender,
            dex
        );
        states.latestUnverifiedTrade = orderId;
        (bool success, bytes memory result) = adapterAddress.delegatecall(
            abi.encodeWithSignature(
                "takeOrder(address,address,uint256,address)",
                dexAddress,
                DEFAULT_TOKEN,
                amountToPay,
                tokenToBuy
            )
        );
        Orders(params.ordersContract).updateExchangeAmount(orderId, BytesLib.toUint(result, 0));
        require(success, "openOrder - delegatecall failed");
        emit delegateResult(success, result);
        emit newOrder(orderId);
    }

    function approveForCloseOrder(bytes32 orderId) public {
        (, , uint amountToSellBack, , , , , , address tokenToSellBack, , , bytes32 dexId) = Orders(
            params.ordersContract).orders(orderId
        );
        address adapterAddress = AdapterRegistry(params.adapterRegistryContract).getAdapterAddress(dexId);
        address dexAddress = AbstractAdapter(adapterAddress).dexAddress();

        IERC20(tokenToSellBack).approve(dexAddress, amountToSellBack);
    }

    function wipeApprovalForCloseOrder(bytes32 orderId) public {
        (, , , , , , , , address tokenToSellBack, , , bytes32 dexId) = Orders(
            params.ordersContract).orders(orderId
        );
        address adapterAddress = AdapterRegistry(params.adapterRegistryContract).getAdapterAddress(dexId);
        address dexAddress = AbstractAdapter(adapterAddress).dexAddress();

        IERC20(tokenToSellBack).approve(dexAddress, 0);
    }

    function closeOrder(bytes32 orderId) public {
        //approveForCloseOrder(orderId);
        (, , uint amountToSellBack, , , , , address tokenToBuyBack, address tokenToSellBack, , , bytes32 dexId) = Orders(
            params.ordersContract).orders(orderId
        );
        address adapterAddress = AdapterRegistry(params.adapterRegistryContract).getAdapterAddress(dexId);
        address dexAddress = AbstractAdapter(adapterAddress).dexAddress();

        (bool success, bytes memory result) = adapterAddress.delegatecall(
            abi.encodeWithSignature(
                "takeOrder(address,address,uint256,address)",
                dexAddress,
                tokenToSellBack,
                amountToSellBack,
                tokenToBuyBack
            )
        );
        // require(success, "closeOrder - delegatecall failed");
        //wipeApprovalForCloseOrder(orderId);
        emit delegateResult(success, result);
    }

    function verifyLatestTrade() public {
        require(states.latestUnverifiedTrade != 0x0, "verifyLatestTradeSuccess - no unverified trade");
        Orders(params.ordersContract).verifyStatus(states.latestUnverifiedTrade);
        states.latestUnverifiedTrade = 0x0;
    }

    function verifyTrade(bytes32 orderId) public {
        Orders(params.ordersContract).verifyStatus(orderId);
    }

    function closeFund() public onlyPM {

    }

    function setEndTime(uint32 _endTime) public onlyPM {
        fundRules.endTime = _endTime;
        require(now < fundRules.endTime, "now > endTime");
    }


}