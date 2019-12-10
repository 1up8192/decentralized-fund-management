import TruffleContract from 'truffle-contract';
import detailedERC20Artifact from '../../../build/contracts/IERC20.json';

export default class ERC20 {
    constructor(provider, account, web3) {
        this.erc20 = TruffleContract(detailedERC20Artifact);
        this.erc20.setProvider(provider);
        this.account = account;
        this.web3 = web3;
    }

    async getSymbol(tokenAddress) {
        const instance = await this.erc20.at(tokenAddress);
        return instance.symbol.call({from: this.account});
    }

    async getName(tokenAddress) {
        const instance = await this.erc20.at(tokenAddress);
        return instance.name.call({from: this.account});
    }

    async getDecimals(tokenAddress) {
        const instance = await this.erc20.at(tokenAddress);
        return instance.decimals.call({from: this.account});
    }

    async getBalance(tokenAddress, fundAddress) {
        const instance = await this.erc20.at(tokenAddress);
        return instance.balanceOf.call(fundAddress, {from: this.account});
    }
}
