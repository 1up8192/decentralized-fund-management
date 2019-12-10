const Migrations = artifacts.require("Migrations");

const fs = require('fs');


module.exports = function(deployer, network) {
  deployer.deploy(Migrations);
  
  process.env.NETWORK = network; // Network Id, for instance "ganache" (for testing)
  
  const networkObject = {
    "network": network
  };
  const json = JSON.stringify(networkObject);

  fs.writeFile('network.json', json, 'utf8', function (err) {
    if (err) throw err;
  }); 
};
