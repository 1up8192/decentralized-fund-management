pragma solidity ^0.5.6;

import './FundFactory.sol';
import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';


contract Orders {

    address fundFactoryAddress;

    enum Status {UnverifiedNew, FailedToOpen, VerifiedOpen, UnverifiedChanged, UnverifiedClosed, VerifiedClosed}

    uint TIMEOUT = 10 minutes; //todo in constructor + ownable

    struct Order {
        Status status;
        uint baseAmount;
        uint exchangeAmount;
        uint returnAmount;
        uint stopLossPrice;
        uint previousAmountForVerfication;
        uint tradeTime;
        address baseToken;
        address exchangeToken;
        address trader;
        address fund;
        bytes32 dex;
    }

    mapping(bytes32 => Order) public orders;

    event orderOpened(bytes32 orderId);
    event orderClosed();
    event orderChanged();
    event tradeSuccess();
    event tradeFailed();
    event verificationFailed();

    modifier onlyFund {
        require(FundFactory(fundFactoryAddress).isFund(msg.sender), "modifier onlyFund");
        _;
    }

    modifier onlyCreatorFund(bytes32 orderId) {
        require(orders[orderId].fund == msg.sender, "modifier onlyCreatorFund");
        _;
    }

    constructor(address _fundFactoryAddress) public{
        fundFactoryAddress = _fundFactoryAddress;
    }

    function addNewOrder(
        uint baseAmount,
        uint exchangeAmount,
        uint stopLossPrice,
        address baseToken,
        address exchangeToken,
        address trader,
        bytes32 dex
    ) public /*onlyFund fixme*/ returns (bytes32) {
        bytes32 orderId = generateId(msg.sender);
        orders[orderId].status = Status.UnverifiedNew;
        orders[orderId].baseAmount = baseAmount;
        orders[orderId].exchangeAmount = exchangeAmount;
        orders[orderId].stopLossPrice = stopLossPrice;
        orders[orderId].previousAmountForVerfication = IERC20(exchangeToken).balanceOf(msg.sender);
        orders[orderId].tradeTime = now;
        orders[orderId].baseToken = baseToken;
        orders[orderId].exchangeToken = exchangeToken;
        orders[orderId].fund = msg.sender;
        orders[orderId].trader = trader;
        orders[orderId].dex = dex;
        emit orderOpened(orderId);
        return orderId;
    }

    function closeOrder(bytes32 orderId, uint baseAmount) public onlyCreatorFund(orderId) {
        orders[orderId].status = Status.UnverifiedClosed;
        orders[orderId].baseAmount = baseAmount;
        orders[orderId].previousAmountForVerfication = IERC20(orders[orderId].baseToken).balanceOf(msg.sender);
        orders[orderId].tradeTime = now;
    }

    function changeOrder(bytes32 orderId, uint deltaFrom, uint deltaTo, bool buyMore) public onlyCreatorFund(orderId) {
        //todo later
    }

    function updateExchangeAmount(bytes32 orderId, uint exchangeAmount) public onlyCreatorFund(orderId) {
        orders[orderId].exchangeAmount = exchangeAmount;
    }

    function verifyStatus(bytes32 orderId) public onlyCreatorFund(orderId) returns (bool) {
        Order memory order = orders[orderId];
        bool verified = false;
        if (order.status == Status.UnverifiedNew) { //NEW
            if (order.previousAmountForVerfication + order.exchangeAmount >= IERC20(order.exchangeToken).balanceOf(order.fund)) { // ok, got the funds from dex
                orders[orderId].status = Status.VerifiedOpen;
                verified = true;
            } else {
                if (now > order.tradeTime + TIMEOUT) { //no funds gotten from dex and timeout
                    orders[orderId].status = Status.FailedToOpen;
                }
            }
        }
        if (order.status == Status.UnverifiedClosed) { //CLOSE
            if (order.previousAmountForVerfication + order.baseAmount >= IERC20(order.baseToken).balanceOf(order.fund)) { // ok, got the funds from dex
                orders[orderId].status = Status.VerifiedClosed;
                verified = true;
            } else {
                if (now > order.tradeTime + TIMEOUT) { //no funds gotten from dex and timeout
                    orders[orderId].status = Status.VerifiedOpen;
                }
            }
        }
        return verified;
        //todo change order part later
    }

    function generateId(address fund) private view returns (bytes32){
        return (keccak256(abi.encode(fund, now)));
    }

}