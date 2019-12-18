const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const truffleAssert = require('truffle-assertions');

const getBalance = async (web3, account) => {
    const balance = await web3.eth.getBalance(account);          
    return balance;
};

  contract("Fund investment test", async accounts => {
      const endTime = 2**32-1; //highest possible date

      const weiAmountToInvest = 12345;
      let fundInstance;
      let fundAddress;
    
      beforeEach(async () => {
        const fundFactoryInstance = await FundFactory.deployed();
        const transactionReceipt = await fundFactoryInstance.createFund(
        endTime,
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

      it("should fail to invest when closed ended fund ended", async () => { //all funds are closed ended for now
        const weiAmountToInvest = web3.utils.toWei("0.00002", "ether");
        await fundInstance.closeFund({ from: accounts[0]});
        await truffleAssert.fails(fundInstance.invest({ from: accounts[1], value: weiAmountToInvest}));
      });

})