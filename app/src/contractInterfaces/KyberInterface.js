import TruffleContract from 'truffle-contract';
import kyberInterfaceArtifact from '../../../build/contracts/KyberInterface.json';

export default class KyberInterface {

    constructor(provider, account, web3, network) {
        this.kyberInterface = TruffleContract(kyberInterfaceArtifact);
        this.kyberInterface.setProvider(provider);
        this.account = account;
        this.web3 = web3;

        if (network === "kovan") {
            this.address = "0x692f391bCc85cefCe8C237C01e1f636BbD70EA4D";
        }
    }

    /**
     *
     * @param {string} toSell //token contract address to sell (ETH alias: 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)
     * @param {string} toBuy //token contract address to buy (ETH alias: 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)
     * @param {number} amountToSell //token amount to sell (can be 0 for simplicity)
     *
     * @returns {number} rate
     */
    async getExpectedRate(toSell, toBuy, amountToSell) {
        const instance = await this.kyberInterface.at(this.address);

        return instance.getExpectedRate(toSell, toBuy, amountToSell, {from: this.account});
    }
}
