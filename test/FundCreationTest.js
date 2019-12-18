const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const truffleAssert = require('truffle-assertions');

contract("Fund creation test", async accounts => {
    const expectedEndTime = 2**32-1; //highest possible date

    let fundAddress;
    let transactionReceipt;

    beforeEach(async () => {
      const fundFactoryInstance = await FundFactory.deployed();
      transactionReceipt = await fundFactoryInstance.createFund(
        expectedEndTime, 
        {from: accounts[0]}
      );
      fundAddress = getFundAddress(transactionReceipt);
    });

    it("should create a Fund contract instance", async () => {
      const fundInstance = await Fund.at(fundAddress);
      const fundRules = await fundInstance.fundRules.call();

      const actualEndTime = fundRules[2];

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