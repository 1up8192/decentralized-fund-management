const HDWalletProvider = require('@truffle/hdwallet-provider');
//const HDWalletProvider = require('truffle-hdwallet-provider');
const secrets = require('./secrets.json');

module.exports = {
  networks: {
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6700000,
    },
    /* mainnet: {
      provider: () => new HDWalletProvider(secrets.mnemonic, `https://mainnet.infura.io/v3/${secrets.infuraProjectId}`),
      network_id: 1,
      gas: 6700000,
      gasPrice: 5000000000, // 5 gwei 
    },*/
    rinkeby: {
      provider: () => new HDWalletProvider(secrets.mnemonic, `https://rinkeby.infura.io/v3/${secrets.infuraProjectId}`, 0, 10),
      network_id: 4,
      gas: 1000000,
      gasPrice: 1000000000, // 1 gwei */
    },
    kovan: {
      provider: () => new HDWalletProvider(secrets.mnemonic, `https://kovan.infura.io/v3/${secrets.infuraProjectId}`, 0, 10),
      network_id: 42,
      gas: 6000000,
      gasPrice: 2000000000, // 1 gwei
    },
    /* ropsten: {
      provider: () => new HDWalletProvider(secrets.mnemonic, `https://ropsten.infura.io/v3/${secrets.infuraProjectId}`),
      network_id: 3,
      gas: 6700000,
      gasPrice: 20000000000, // 20 gwei
    }, */
  },
  compilers: {
    solc: {
      version: "0.5.16",    // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
};
