const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const truffleAssert = require('truffle-assertions');

const getBalance = async (web3, account) => {
    const balance = await web3.eth.getBalance(account);          
    return balance;
};

  contract("Fund investment test", async accounts => {
      const startTime = 2**32-2; //highest possible dates
      const endTime = 2**32-1; //highest possible dates

      const globalTraderLimit = 0;
      const investMin = 0;
      const investMax = 0;
      const tarderList = [];
      const traderLimitList = [];

      const weiAmountToInvest = 12345;
      let fundInstance;
      let fundAddress;
    
      beforeEach(async () => {
        const fundFactoryInstance = await FundFactory.deployed();
        const transactionReceipt = await fundFactoryInstance.createFund(
        startTime,
        endTime, 
        globalTraderLimit,
        investMin,
        investMax,
        tarderList,
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
    
      it("should increase the investment of the investor in the given fund", async () => {
        const currentInvestment = await fundInstance.investments(accounts[1]);

        await fundInstance.invest({ from: accounts[1], value: weiAmountToInvest});
        const updatedInvestment = await fundInstance.investments(accounts[1]);
        const updatedFundBalance = await getBalance(web3, fundAddress);

        const expectedInvestment = currentInvestment.toNumber() + weiAmountToInvest;
        const expectedFundBalance = weiAmountToInvest;

        assert.equal(updatedInvestment.toNumber(), expectedInvestment);
        assert.equal(updatedFundBalance, expectedFundBalance);
      });
    
      it("should raise event when investment is made", async () => {
          const transactionReceipt = await fundInstance.invest({ from: accounts[1], value: weiAmountToInvest });
          truffleAssert.eventEmitted(transactionReceipt, 'newInvestment', e => {
            return e.amount == weiAmountToInvest && e.investor == accounts[1];
          });
      });

      it("should set fundRules properly (min-max investment)", async () => {
          const minInvestmentInWei = web3.utils.toWei("0.00001", "ether");
          const maxInvestmentInWei = web3.utils.toWei("0.00003", "ether");

          await fundInstance.setFundRules(
              startTime, endTime, globalTraderLimit, minInvestmentInWei, maxInvestmentInWei, [false, false, false, true, true]);
          const fundRules = await fundInstance.fundRules.call();

          assert.equal(fundRules[5].toNumber(), minInvestmentInWei);
          assert.equal(fundRules[6].toNumber(), maxInvestmentInWei);
      });

      it("should fail to invest when closed ended fund is active", async () => { //all funds are closed ended for now
        const weiAmountToInvest = web3.utils.toWei("0.00002", "ether");
        await fundInstance.startFundNow({ from: accounts[0]});
        await truffleAssert.fails(fundInstance.invest({ from: accounts[1], value: weiAmountToInvest}));
      });

      it("should fail to invest to fund when the investment amount is lower than the limit", async () => {
        const minInvestmentInWei = web3.utils.toWei("0.00002", "ether");
        const maxInvestmentInWei = web3.utils.toWei("0.00003", "ether");
        const weiAmountToInvest = web3.utils.toWei("0.00001", "ether");

        await fundInstance.setFundRules(
            startTime, endTime, globalTraderLimit, minInvestmentInWei, maxInvestmentInWei, [false, false, false, true, true]);

        await truffleAssert.fails(fundInstance.invest({ from: accounts[1], value: weiAmountToInvest}));
      });

      it("should fail to invest to fund when the investment amount is higher than the limit", async () => {
        const minInvestmentInWei = web3.utils.toWei("0.00001", "ether");
        const maxInvestmentInWei = web3.utils.toWei("0.00003", "ether");
        const weiAmountToInvest = web3.utils.toWei("0.00005", "ether");

        await fundInstance.setFundRules(
            startTime, endTime, globalTraderLimit, minInvestmentInWei, maxInvestmentInWei, [false, false, false, true, true]);

        await truffleAssert.fails(fundInstance.invest({ from: accounts[1], value: weiAmountToInvest}));
      });

      it("should invest to fund properly when the investment amount is in the predefined range", async () => {
        const minInvestmentInWei = web3.utils.toWei("0.00001", "ether");
        const maxInvestmentInWei = web3.utils.toWei("0.00003", "ether");
        const weiAmountToInvest = web3.utils.toWei("0.00002", "ether");

        await fundInstance.setFundRules(
            startTime, endTime, globalTraderLimit, minInvestmentInWei, maxInvestmentInWei, [false, false, false, true, true]);

        await truffleAssert.passes(fundInstance.invest({ from: accounts[1], value: weiAmountToInvest}));
        const updatedInvestment = await fundInstance.investments.call(accounts[1]);

        assert.equal(updatedInvestment.toNumber(), weiAmountToInvest);
      });
})