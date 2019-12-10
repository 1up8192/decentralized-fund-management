const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const truffleAssert = require('truffle-assertions');

contract("Fund creation test", async accounts => {
    const expectedStartTime = 26;
    const expectedEndTime = 32;
    const globalTraderLimit = 0;
    const investMin = 0;
    const investMax = 0;
    const tarderList = [];
    const traderLimitList = [];

    let fundAddress;
    let transactionReceipt;

    beforeEach(async () => {
      const fundFactoryInstance = await FundFactory.deployed();
      transactionReceipt = await fundFactoryInstance.createFund(
        expectedStartTime,
        expectedEndTime, 
        globalTraderLimit,
        investMin,
        investMax,
        tarderList,
        traderLimitList,
        {from: accounts[0]}
      );
      fundAddress = getFundAddress(transactionReceipt);
    });

    it("should create a Fund contract instance", async () => {
      const fundInstance = await Fund.at(fundAddress);
      const fundRules = await fundInstance.fundRules.call();

      const actualStartTime = fundRules[2];
      const actualEndTime = fundRules[3];

      assert.equal(actualStartTime, expectedStartTime);
      assert.equal(actualEndTime, expectedEndTime);
    });

    it("should emit fundCreated event with the fund's address", async () => {
      truffleAssert.eventEmitted(transactionReceipt, 'fundCreated', e => {
          return e.fundAddress == fundAddress;
      });
    });
})

function getFundAddress(transactionResult) {
  let fundAddress;
  transactionResult.logs.forEach((item) => {
    if (item.args.fundAddress) {
      fundAddress = item.args.fundAddress;
      return;
    }
  });

  return fundAddress;
}