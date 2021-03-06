//https://developer.kyber.network/docs/Environments-Kovan/
const Fund = artifacts.require("Fund");
const FundFactory = artifacts.require("FundFactory");
const KyberAdapter = artifacts.require("KyberAdapter");
const MockERC20 = artifacts.require("MockERC20");
const IERC20 = artifacts.require("IERC20");
const MockKyber = artifacts.require("MockKyber");

const truffleAssert = require('truffle-assertions');

const getBalance = async (web3, account) => {
  const balance = await web3.eth.getBalance(account);          
  return balance;
};

contract("Fund trade test - close order", async accounts => {
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
    
    //buy DAI
    const ETHamount = web3.utils.toWei("0.000001", "ether");
    const openOrderTransactionReceipt = await fundInstance.openOrder(ETHamount, 0, DAIkovan, web3.utils.asciiToHex('kyber'), {from: accounts[0]});

    openOrderTransactionReceipt.logs.forEach((item) => {
      if (item.args.orderId) {
        orderId = item.args.orderId;
        return;
      }
    });
  });
      
  it("should sell back DAI for ETH", async () => {
    const fundETHbalanceBefore = await getBalance(web3, fundAddress);
    await fundInstance.approveForCloseOrder(orderId, { from: accounts[0]});
    const gasPrice = web3.utils.toWei("1", 'gwei');
    const txResult = await fundInstance.closeOrder(orderId, { from: accounts[0]});    
    const txFeeInETH = txResult.receipt.gasUsed * gasPrice;
    const fundETHbalanceAfter = await getBalance(web3, fundAddress);
    assert.isTrue(fundETHbalanceAfter > fundETHbalanceBefore - txFeeInETH);
    assert.isFalse(fundETHbalanceAfter === fundETHbalanceBefore);
  });
});