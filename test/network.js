const Network = require("../network.json")

contract("Fund creation test", async accounts => {
    console.log("network: ");
    console.log(process.env.NETWORK);
    console.log(Network.network);

});