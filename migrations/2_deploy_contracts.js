const KyberAdapter = artifacts.require("KyberAdapter");
const AdapterRegistry = artifacts.require("AdapterRegistry");
const Orders = artifacts.require("Orders");
const FundFactory = artifacts.require("FundFactory");
const MockERC20 = artifacts.require("MockERC20");
const MockKyber = artifacts.require("MockKyber");


module.exports = async function(deployer, network) {
  
  let kyberDexAddress;
  if(network == 'kovan' || network == 'kovan-fork'){
    kyberDexAddress = '0x692f391bCc85cefCe8C237C01e1f636BbD70EA4D';
  } else if (network == 'ganache' || network == 'test') {
    await deployer.deploy(MockERC20);
    await deployer.deploy(MockKyber, MockERC20.address);
    const mockERC20Instance = await MockERC20.deployed();
    await mockERC20Instance.mint(MockKyber.address, web3.utils.toWei("100", "ether"));
    kyberDexAddress = MockKyber.address;    
  }
 
  await deployer.deploy(KyberAdapter, kyberDexAddress, true);
  await deployer.deploy(AdapterRegistry, ["kyber"].map(name => web3.utils.asciiToHex(name)), [KyberAdapter.address]);
  await deployer.deploy(FundFactory, AdapterRegistry.address);
  await deployer.deploy(Orders, FundFactory.address);
  const fundFactoryInstance = await FundFactory.deployed();
  await fundFactoryInstance.setUpContractInstances(Orders.address);

};
