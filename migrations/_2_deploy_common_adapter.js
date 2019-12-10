const AbstractAdapter = artifacts.require("AbstractAdapter");
const DexRegistry = artifacts.require("DexRegistry");
const Fund = artifacts.require("Fund");
const fs = require('fs');

module.exports = function(deployer, network) {
  let dexAddress = '0x0000000000000000000000000000000000000000';
  deployer.deploy(AbstractAdapter, dexAddress, true);

};
