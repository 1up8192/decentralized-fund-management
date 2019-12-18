//https://developer.kyber.network/docs/Environments-Kovan/
const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const KyberAdapter = artifacts.require("KyberAdapter");
const MockERC20 = artifacts.require("MockERC20");
const IERC20 = artifacts.require("IERC20");
const MockKyber = artifacts.require("MockKyber");

const truffleAssert = require('truffle-assertions');

contract("Fund trade test - open", async accounts => {
  const network = process.env.NETWORK;
  const endTime = 2**32-1; //highest possible dates

  let fundInstance;
  let fundAddress;

  let DAIkovan;
  let daiKovanInstance;
  
  before(async () => {
    const fundFactoryInstance = await FundFactory.deployed();
    transactionReceipt = await fundFactoryInstance.createFund(
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
    const weiAmountToInvest = web3.utils.toWei("0.00001", "ether");
      
    await fundInstance.invest({ from: accounts[0], value: weiAmountToInvest});

    if (network == 'ganache' || network == 'test') {
      const mockERC20Instance = await MockERC20.deployed();
      DAIkovan = mockERC20Instance.address;

    } else if (network == 'kovan' || network == 'kovan-fork'){
      DAIkovan = "0xC4375B7De8af5a38a93548eb8453a498222C4fF2";
    } 

    daiKovanInstance = await IERC20.at(DAIkovan);
  });
  
  it("should buy DAI for ETH", async () => {
    const ETHamount = web3.utils.toWei("0.000001", "ether");
    await fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]});
    const daiAmount = await daiKovanInstance.balanceOf.call(fundInstance.address , {from: accounts[0]})
    assert.isAbove(daiAmount.toNumber(), 0)
  });

  it("should fail to trade when closed ended fund ended", async () => {
    const ETHamount = web3.utils.toWei("0.000001", "ether");    
    await fundInstance.closeFund({ from: accounts[0]});
    await truffleAssert.fails(fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]}));
});   
});