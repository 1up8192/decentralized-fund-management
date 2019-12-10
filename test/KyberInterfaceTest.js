//https://developer.kyber.network/docs/Environments-Kovan/

const FundFactory = artifacts.require("FundFactory");
const KyberInterface = artifacts.require("KyberInterface");
const MockERC20 = artifacts.require("MockERC20");
const AdapterRegistry = artifacts.require("AdapterRegistry");
const AbstractAdapter = artifacts.require("AbstractAdapter");
const IERC20 = artifacts.require("IERC20");

const getBalance = async (web3, account) => {
  const balance = await web3.eth.getBalance(account);          
  return balance;
};

contract("kyber interface test", async accounts =>{
  const network = process.env.NETWORK;
  const ETHinternal = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  let dexAddress;

  beforeEach(async () => {
    const adapterRegistryInstance = await AdapterRegistry.deployed();
    adapterAddress = await adapterRegistryInstance.getAdapterAddress(web3.utils.asciiToHex('kyber'));
    abstractAdapterInstance = await AbstractAdapter.at(adapterAddress);
    dexAddress = await abstractAdapterInstance.dexAddress.call();
  });

  it("should get rate", async () => {
      let DAIkovan;
      if (network == 'ganache' || network == 'test') {
        const mockERC20Instance = await MockERC20.deployed();
        DAIkovan = mockERC20Instance.address;
      } else if (network == 'kovan'){
        DAIkovan = "0xC4375B7De8af5a38a93548eb8453a498222C4fF2";
      }          

      const kyberInterfaceInstance = await KyberInterface.at(dexAddress.toString());
      const ETHamount = web3.utils.toWei("0.00001", 'ether');;
      const rate = await kyberInterfaceInstance.getExpectedRate.call(ETHinternal, DAIkovan, ETHamount);
      assert.isNotNull(rate);

      
    });

    it("should buy DAI", async () => {
      let DAIkovan;
      if (network == 'ganache' || network == 'test') {
        const mockERC20Instance = await MockERC20.deployed();
        DAIkovan = mockERC20Instance.address;
      } else if (network == 'kovan' || network == 'kovan-fork'){
        DAIkovan = "0xC4375B7De8af5a38a93548eb8453a498222C4fF2";
      }       

      daiKovanInstance = await IERC20.at(DAIkovan);
      const daiAmountBefore = await daiKovanInstance.balanceOf.call(accounts[0] , {from: accounts[0]})
      
      const kyberInterfaceInstance = await KyberInterface.at(dexAddress.toString());
      const ETHamount = web3.utils.toWei("0.00001", 'ether');;
      const tx = await kyberInterfaceInstance.swapEtherToToken(DAIkovan, 0, {from: accounts[0], value: ETHamount});
      assert.isNotNull(tx);

      const daiAmountAfter = await daiKovanInstance.balanceOf.call(accounts[0] , {from: accounts[0]});
      assert.isTrue(daiAmountAfter.toNumber() > daiAmountBefore.toNumber());
    });

    it("should buy DAI and sell back", async () => {
      let DAIkovan;
      if (network == 'ganache' || network == 'test') {
        const mockERC20Instance = await MockERC20.deployed();
        DAIkovan = mockERC20Instance.address;
      } else if (network == 'kovan' || network == 'kovan-fork'){
        DAIkovan = "0xC4375B7De8af5a38a93548eb8453a498222C4fF2";
      }
      
      daiKovanInstance = await IERC20.at(DAIkovan);
      const daiAmountBefore = await daiKovanInstance.balanceOf.call(accounts[0] , {from: accounts[0]})
      
      const kyberInterfaceInstance = await KyberInterface.at(dexAddress.toString());
      const ETHamount = web3.utils.toWei("0.00001", 'ether');;
      const tx = await kyberInterfaceInstance.swapEtherToToken(DAIkovan, 0, {from: accounts[0], value: ETHamount});
      assert.isNotNull(tx);
      daiKovanInstance = await IERC20.at(DAIkovan);
      const daiAmountAfter = await daiKovanInstance.balanceOf.call(accounts[0] , {from: accounts[0]});
      assert.isTrue(daiAmountAfter.toNumber() > daiAmountBefore.toNumber());

      await daiKovanInstance.approve(dexAddress, daiAmountAfter, {from: accounts[0]});

      const ETHbalanceBefore = await getBalance(web3, accounts[0]);

      const gasPrice = web3.utils.toWei("1", 'gwei');

      const txResult = await kyberInterfaceInstance.swapTokenToEther(DAIkovan, daiAmountAfter, 0, {from: accounts[0], gasPrice: gasPrice});

      const txFeeInETH = txResult.receipt.gasUsed * gasPrice;
      
      const ETHbalanceAfter = await getBalance(web3, accounts[0]);

      assert.isTrue(ETHbalanceAfter > ETHbalanceBefore - txFeeInETH);
      assert.isFalse(ETHbalanceAfter === ETHbalanceBefore);

    });
})