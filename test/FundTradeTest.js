//https://developer.kyber.network/docs/Environments-Kovan/
const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const KyberAdapter = artifacts.require("KyberAdapter");
const MockERC20 = artifacts.require("MockERC20");
const IERC20 = artifacts.require("IERC20");
const MockKyber = artifacts.require("MockKyber");

const truffleAssert = require('truffle-assertions');

contract("Fund trader manipulation test", async accounts => {
  const network = process.env.NETWORK;
  const startTime = 2**32-2; //highest possible dates
  const endTime = 2**32-1; //highest possible dates

  const globalTraderLimit = 0; //unlmited
  const investMin = 0;
  const investMax = 0; //unlmited
  const traderList = [];
  const traderLimitList = [];

  let fundInstance;
  let fundAddress;

  let DAIkovan;
  
  before(async () => {
    const fundFactoryInstance = await FundFactory.deployed();
    const transactionReceipt = await fundFactoryInstance.createFund(
      startTime,
      endTime, 
      globalTraderLimit,
      investMin,
      investMax,
      traderList,
      traderLimitList,
      {from: accounts[0]}
    );
    transactionReceipt.logs.forEach((item) => {
      if (item.args.fundAddress) {
        fundAddress = item.args.fundAddress;
        return;
      }
    });
    fundInstance = await Fund.at(fundAddress);
  });

  it("should add trader", async () => {
    await fundInstance.addTrader([accounts[0].toString()], [0], { from: accounts[0] }); //unlmited
    const traderLimit = await fundInstance.traderLimit.call(accounts[0], { from: accounts[0] });
    assert.isTrue(traderLimit !== web3.utils.toBN(0));
  });
});


contract("Fund trade test - open", async accounts => {
  const network = process.env.NETWORK;
  const startTime = 2**32-2; //highest possible dates
  const endTime = 2**32-1; //highest possible dates

  const globalTraderLimit = 0; //unlmited
  const investMin = 0;
  const investMax = 0; //unlmited
  const traderList = [];
  const traderLimitList = [];

  let fundInstance;
  let fundAddress;

  let DAIkovan;
  let daiKovanInstance;
  
  before(async () => {
    const fundFactoryInstance = await FundFactory.deployed();
    transactionReceipt = await fundFactoryInstance.createFund(
      startTime,
      endTime, 
      globalTraderLimit,
      investMin,
      investMax,
      traderList,
      traderLimitList,
      {from: accounts[0]}
    );
    transactionReceipt.logs.forEach((item) => {
      if (item.args.fundAddress) {
        fundAddress = item.args.fundAddress;
        return;
      }
    });
    fundInstance = await Fund.at(fundAddress);
    const weiAmountToInvest = web3.utils.toWei("0.00001", "ether");
      
    await fundInstance.invest({ from: accounts[0], value: weiAmountToInvest});
    await fundInstance.startFundNow({ from: accounts[0]});

    if (network == 'ganache' || network == 'test') {
      const mockERC20Instance = await MockERC20.deployed();
      DAIkovan = mockERC20Instance.address;

    } else if (network == 'kovan' || network == 'kovan-fork'){
      DAIkovan = "0xC4375B7De8af5a38a93548eb8453a498222C4fF2";
    } 
    await fundInstance.addTrader([accounts[0].toString()], [0], { from: accounts[0] }); //unlmited

    daiKovanInstance = await IERC20.at(DAIkovan);
  });
  
  it("should buy DAI for ETH", async () => {
    const ETHamount = web3.utils.toWei("0.000001", "ether");
    await fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]});
    const daiAmount = await daiKovanInstance.balanceOf.call(fundInstance.address , {from: accounts[0]})
    assert.isAbove(daiAmount.toNumber(), 0)
  });

  it("should set start and end times and fail to trade, when inactive", async () => {
    const ETHamount = web3.utils.toWei("0.000001", "ether");
    
    const startTime1 = 0;
    const endTime1 = 1;
    await fundInstance.setFundRules(startTime1, endTime1, 0, 0, 0, [true, true, false, false, false]);
    const fundRules1 = await fundInstance.fundRules.call();
    const acturalStartTime1 = fundRules1[2];
    const actualEndTime1 = fundRules1[3];
    assert.equal(acturalStartTime1, startTime1, "startTime1 should be what was set");
    assert.equal(actualEndTime1, endTime1, "endTime1 should be what was set");

    await truffleAssert.fails(fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]}));

    const startTime2 = 2**32-2;
    const endTime2 = 2**32-1;
    await fundInstance.setFundRules(startTime2, endTime2, 0, 0, 0, [true, true, false, false, false]);
    const fundRules2 = await fundInstance.fundRules.call();
    const acturalStartTime2 = fundRules2[2];
    const actualEndTime2 = fundRules2[3];
    assert.equal(acturalStartTime2, startTime2, "startTime2 should be what was set");
    assert.equal(actualEndTime2, endTime2, "endTime2 should be what was set");

    await truffleAssert.fails(fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]}));
});

  it("should set global limit and fail to trade when over limit", async () => {
      const globalLimitToSet = web3.utils.toWei("0.000002", "ether");
      await fundInstance.setFundRules(0, 0, globalLimitToSet, 0, 0, [false, false, true, false, false]);
      const fundRules = await fundInstance.fundRules.call();
      const actualGlobalLimit = fundRules[4];
      assert.equal(actualGlobalLimit, globalLimitToSet, "global limit should be what was set");
      const ETHamount = web3.utils.toWei("0.000003", "ether");
      await truffleAssert.fails(fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]}));

  });

  it("should set trader limit and fail to trade when over limit", async () => {
    const traderLimitToSet = web3.utils.toWei("0.0000015", "ether");
    await fundInstance.changeTraderLimit(accounts[0], traderLimitToSet, {from: accounts[0]});
    const actualTraderLimit = await fundInstance.traderLimit.call(accounts[0], { from: accounts[0] });
    assert.equal(actualTraderLimit, traderLimitToSet, "trader limit should be what was set");
    const ETHamount = web3.utils.toWei("0.0000016", "ether");
    await truffleAssert.fails(fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]}));
  });

  it("should set global and trader limit and be able to trade when whithin limit", async () => {
    const ETHamount = web3.utils.toWei("0.000001", "ether");
    const traderLimitToSet = web3.utils.toWei("0.0000015", "ether");
    await fundInstance.changeTraderLimit(accounts[0], traderLimitToSet, {from: accounts[0]});
    const globalLimitToSet = web3.utils.toWei("0.000002", "ether");
    await fundInstance.setFundRules(0, 0, globalLimitToSet, 0, 0, [false, false, true, false, false]);
    await truffleAssert.fails(fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]}));
    const daiAmount = await daiKovanInstance.balanceOf.call(fundInstance.address , {from: accounts[0]})
    assert.isAbove(daiAmount.toNumber(), 0)
  });    
});