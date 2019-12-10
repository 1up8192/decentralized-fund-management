pragma solidity ^0.5.6;

import './Orders.sol';
import './CommonInternalDexInterface.sol';
import './DexAdapters/AbstractAdapter.sol';
import './AdapterRegistry.sol';
import './DexAdapters/KyberAdapter.sol';
import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';
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
        uint32 startTime;
        uint32 endTime;
        uint globalTraderLimit;
        uint investMin;
        uint investMax;
        bool openEnded;
    }

    Params public params;
    States public states;
    FundRules public fundRules;

    address constant DEFAULT_TOKEN = 0x0000000000000000000000000000000000000000; //Ether
    uint256 constant UINT256_MAX = ~uint256(0);

    mapping(address => bool) tokensOwned; //token address => owned/notowned

    mapping(address => uint) public investments; //investor => amount

    //roles
    mapping(address => bool) public admins;

    mapping(address => uint) public traderLimit; //if UINT256_MAX, global applies
    mapping(address => uint) public onOrdersByTrader;


    event newInvestment(address investor, uint amount);
    event newWithdrawal(address investor, uint amount);
    event newOrder(bytes32 orderId);
    event adminsChange(address[] adminList, bool isActive); //added=true, removed=false
    event stopLossTriggered();
    event fundClosed();

    modifier onlyPM {
        require(params.portfolioManager == msg.sender, "modifier onlyPM");
        _;
    }

    modifier onlyAdmin {
        require(admins[msg.sender], "modifier onlyAdminr");
        _;
    }
    
    modifier onlyTrader {
        require(traderLimit[msg.sender] > 0, "modifier onlyTrader");
        _;
    }

    constructor (
        address _portfolioManager,
        address _orders,
        address _adapterRegistry,
        uint32 _startTime,
        uint32 _endTime,
        uint _globalTraderLimit,
        uint _investMin,
        uint _investMax,
        bool _openEnded,
        address[] memory traderAddresses,
        uint[] memory traderLimits
    ) public {
        require(_startTime < _endTime, "startTime > endTime");
        require(_investMax == 0 || _investMin < _investMax, "investMin > investMax");
        params.portfolioManager = _portfolioManager;
        params.ordersContract = _orders;
        params.adapterRegistryContract = _adapterRegistry;
        admins[_portfolioManager] = true;
        fundRules.startTime = _startTime;
        fundRules.endTime = _endTime;
        uint globalTraderLimit = _globalTraderLimit == 0 ? UINT256_MAX :_globalTraderLimit; //0: unlimited
        fundRules.globalTraderLimit = globalTraderLimit;
        fundRules.investMin = _investMin;
        uint investMax = _investMax == 0 ? UINT256_MAX :_investMax; //0: unlimited
        fundRules.investMax = investMax;
        fundRules.openEnded = _openEnded;
        addTraderPrivate(traderAddresses, traderLimits);
    }

    //fallback to be able to be paid
    function() external payable { }

    function invest() public payable {
        require(msg.value >= fundRules.investMin && msg.value <= fundRules.investMax, "investment value out of bounds");
        if (!fundRules.openEnded) require(fundRules.startTime > now, "invest - fund has started");
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

    event delegateResult(bool success, bytes result);

    function openOrder(uint amountToPay, uint amountToBuy, address tokenToBuy, bytes32 dex) public onlyTrader {
        address adapterAddress = AdapterRegistry(params.adapterRegistryContract).getAdapterAddress(dex);
        require(fundRules.startTime < now && fundRules.endTime > now, "fund is not active");
        require(onOrdersByTrader[msg.sender] + amountToPay <= traderLimit[msg.sender], "value over trader limit");
        require(onOrdersByTrader[msg.sender] + amountToPay <= fundRules.globalTraderLimit, "value over global trader limit");
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
        onOrdersByTrader[msg.sender] += amountToPay;
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
        (, uint baseAmount, uint amountToSellBack, , , , , address tokenToBuyBack, address tokenToSellBack, , , bytes32 dexId) = Orders(
            params.ordersContract).orders(orderId
        );
        address adapterAddress = AdapterRegistry(params.adapterRegistryContract).getAdapterAddress(dexId);
        address dexAddress = AbstractAdapter(adapterAddress).dexAddress();

        onOrdersByTrader[msg.sender] -= baseAmount;

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

    function startFundNow() public onlyAdmin {
        require(fundRules.startTime > now, "startFundNow - operation already started");
        fundRules.startTime = uint32(now - 1);
    }

    function closeFund() public onlyAdmin {

    }

    function addAdmin(address[] memory addressList) public onlyPM {
        for(uint i = 0; i < addressList.length; i++) {
            //require(KYC(params.kycAddress).checkKYC(addressList[i]), "addAdmin: not KYC address");
            admins[addressList[i]] = true;
        }
            emit adminsChange(addressList, true);
    }

    function addAdminPrivate(address[] memory addressList) private {
        for(uint i = 0; i < addressList.length; i++) {
            //require(KYC(params.kycAddress).checkKYC(addressList[i]), "addAdmin: not KYC address");
            admins[addressList[i]] = true;
        }
            emit adminsChange(addressList, true);
    }

    function removeAdmin(address[] memory addressList) public onlyPM {
      for(uint i = 0; i < addressList.length; i++) {
        admins[addressList[i]] = false;
      }
        emit adminsChange(addressList, false);
    }

    function addTrader(address[] memory addressList, uint[] memory limitList) public onlyAdmin {
        for(uint i = 0; i < addressList.length; i++) {
            //require(KYC(params.kycAddress).checkKYC(addressList[i]), "addAdmin: not KYC address");
            uint limit = limitList[i]==0 ? UINT256_MAX: limitList[i]; //0:unlmited
            traderLimit[addressList[i]] = limit;
        }
        //todo: emit tradersChange(addressList, true);
    }

    function addTraderPrivate(address[] memory addressList, uint[] memory limitList) private {
        for(uint i = 0; i < addressList.length; i++) {
            //require(KYC(params.kycAddress).checkKYC(addressList[i]), "addAdmin: not KYC address");
            uint limit = limitList[i]==0 ? UINT256_MAX: limitList[i];
            traderLimit[addressList[i]] = limit;
        }
        //todo: emit tradersChange(addressList, false);
    }

    function removeTrader(address[] memory addressList) public onlyAdmin {
      for(uint i = 0; i < addressList.length; i++) {
        traderLimit[addressList[i]] = 0;
      }
        //todo: emit tradersChange(addressList, true);
    }

    function changeTraderLimit(address _traderAddress, uint _limit) public onlyAdmin {
        uint limit = _limit == 0 ? UINT256_MAX : _limit; //0: unlimited, if you want to set limit to 0, remove trader
        traderLimit[_traderAddress] = limit;
    }

    function setFundRules(
        uint32 _startTime,
        uint32 _endTime,
        uint _globalTraderLimit,
        uint _investMin,
        uint _investMax,
        bool[5] memory toSet
        ) public onlyAdmin {
            if(toSet[0]){
                fundRules.startTime = _startTime;
            }
            if(toSet[1]){
                fundRules.endTime = _endTime;
            }
            if(toSet[2]){
                fundRules.globalTraderLimit = _globalTraderLimit;
            }
            if(toSet[3]){
                fundRules.investMin = _investMin;
            }
            if(toSet[4]){
                fundRules.investMax = _investMax;
            }
            require(fundRules.startTime < fundRules.endTime, "startTime > endTime");
            require(fundRules.investMin < fundRules.investMax, "investMin > investMax");

    }


}