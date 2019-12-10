import TruffleContract from 'truffle-contract';
import fundArtifact from '../../../build/contracts/Fund.json';
import PromisifyEvent from '../utils/promisifyEvent';

export default class Fund {

    constructor(provider, account, web3) {
        this.fund = TruffleContract(fundArtifact);
        this.fund.setProvider(provider);
        this.account = account;
        this.web3 = web3;
    }

    /**
     * Get all ETH balance of a given fund contract
     *
     * @param {string} fundAddress address of the Pool this function interacts with
     *
     * @return ETH balance
     */
    async getFundBalance(fundAddress) {
        const instance = await this.fund.at(fundAddress);

        return this.web3.eth.getBalance(instance.address);
    }

    /**
     *
     * @param {string} fundAddress
     *
     * @typedef fundRules
     *
     * @property {number} startTime
     * @property {number} endTime
     *
     * @return {fundRules}
     */
    async getRules(fundAddress) {
        const instance = await this.fund.at(fundAddress);
        const result = await instance.fundRules.call({from: this.account});

        return {
            startTime: result[2],
            endTime: result[3],
            globalTraderLimit: result[4],
            investMin: result[5],
            investMax: result[6]
        }
    }

    /**
     *
     * @param {string} fundAddress
     *
     * @typedef fundParams
     *
     * @property {number} dexRegistry
     * @property {number} orders
     * @property {number} portfolioManager
     *
     * @return {fundParams}
     */
    async getParams(fundAddress) {
        const instance = await this.fund.at(fundAddress);
        const result = await instance.params.call({from: this.account});

        return {
            dexRegistry: result[0].toString(),
            orders: result[1].toString(),
            portfolioManager: result[2].toString(),
        }
    }

    async isInvestor(fundAddress, investorAddress) {
        const instance = await this.fund.at(fundAddress);
        const investment = await instance.investments.call(investorAddress, {from: this.account});

        return (investment !== this.web3.utils.toBN(0));
    }

    async getInvestment(investorAddress, fundAddress) {
        const instance = await this.fund.at(fundAddress);

        return instance.investments.call(investorAddress, {from: this.account});
    }

    /**
     *
     * Make a new investment in the fund - for end users
     *
     * @param {string} fundAddress
     * @param {number} value in wei
     */
    async invest(fundAddress, value) {
        const instance = await this.fund.at(fundAddress);

        return instance.invest({from: this.account, value: value});
    }

    /**
     * Withdraw all investments from the fund - for end users
     */
    async withdraw() {
        //todo
    }

    async isTrader(fundAddress, investorAddress) {
        const instance = await this.fund.at(fundAddress);
        const traderLimit = await instance.traderLimit.call(investorAddress, {from: this.account});
        let result;

        if (traderLimit !== this.web3.utils.toBN(0)) {
            result = true;
        } else {
            result = false;
        }

        return result;
    }

    async getTraderLimit(fundAddress, investorAddress) {
      const instance = await this.fund.at(fundAddress);
      return instance.traderLimit.call(investorAddress, {from: this.account});
  }

    /**
     *
     * @param {string} fundAddress
     * @param {number} amountToPay
     * @param {number} amountToBuy //mindegy, 0
     * @param {string} tokenToBuy //erc20 token address
     * @param {string} dex //mindegy, "0x0"
     */
    async openOrder(fundAddress, amountToPay, amountToBuy, tokenToBuy, dex) {
        const instance = await this.fund.at(fundAddress);
        return instance.openOrder(amountToPay, amountToBuy, tokenToBuy, dex, {from: this.account});
    }

    /**
     *
     * @param {string} fundAddress
     * @param {string[]} addressList
     * @param {number[]} limitList //0: unlimited
     */
    async addTrader(fundAddress, addressList, limitList) {
        const instance = await this.fund.at(fundAddress);
        return instance.addTrader(addressList, limitList, {from: this.account});
    }

    /**
     *
     * @param {string} fundAddress
     * @param {string} traderAddress
     * @param {number} limit //0: unlimited
     */
    async changeTraderLimit(fundAddress, traderAddress, limit) {
        const instance = await this.fund.at(fundAddress);
        return instance.changeTraderLimit(traderAddress, limit, {from: this.account});
    }

    async setFundRules(
        fundAddress,
        startTime,
        endTime,
        globalTraderLimit,
        investMin,
        investMax
    ) {
        const instance = await this.fund.at(fundAddress);
        return instance.setFundRules(
            startTime,
            endTime,
            globalTraderLimit,
            investMin,
            investMax,
            [true, true, true, true, true],
            {from: this.account}
        );
    }

    /**
     * for fund managers
     * close every order and close fund
     */
    async closeFund() {
        //todo
    }

    /**
     *
     * @param {string} fundAddress
     */
    async startFundNow(fundAddress) {
        const instance = await this.fund.at(fundAddress);
        return instance.startFundNow({from: this.account});
    }

    /**
     *  before erc20 trade DEX endpoint contract must be approved of taking the needed amount of erc20 token
     * @param {string} token ethereum address of the token contract
     * @param {number} amount amount of token in wei to approve of, should be same as the from amount of the trade
     * @param {string} dex indentifier of the dex to find it in dex registry
     */
    async approveERC20(token, amount, dex) {
        //todo
        console.log('@todo approveERC20');
        console.log(token);
        console.log(amount);
        console.log(dex);
    }

    /**
     * (ethereum) Event watcher function for new investments
     * @param {funtion} callback should have an event parameter to handle it
     * newInvestment event will have the following retrun values:
     * event.returnvalues: {
     *  investor, -address string
     *  amount -number in wei
     * }
     * rest of the event object will look something like in the end of this example:
     * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34
     */
    async watchNewInvestmentEvent(fundAddress, callback) {
        const instance = await this.fund.at(fundAddress);
        const instanceRawWeb3 = new this.web3.eth.Contract(instance.abi, instance.address);
        instanceRawWeb3.events.newInvestment({fromBlock: 0, toBlock: 'latest'}).on('data', callback);
    }

    /**
     * (ethereum) Event watcher function for new withdrawals
     * @param {funtion} callback should have an event parameter to handle it
     * newWithdrawal event will have the following retrun values:
     * event.returnvalues: {
     *  investor, -address string
     *  amount -number in wei
     * }
     * rest of the event object will look something like in the end of this example:
     * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34
     */
    async watchNewWithdrawalEvent(callback) {
        //todo
        console.log('@todo watchNewWithdrawalEvent');
        console.log(callback);
    }

    /**
     * (ethereum) Event watcher function for stop loss trigger
     * @param {funtion} callback should have an event parameter to handle it
     * stopLossTriggered event will have the no retrun values
     * rest of the event object will look something like in the end of this example:
     * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34
     */
    async watchStopLossTriggeredEvent(callback) {
        //todo
        console.log('@todo watchStopLossTriggeredEvent');
        console.log(callback);
    }

    /**
     * (ethereum) Event watcher function for fund closed event
     * @param {funtion} callback should have an event parameter to handle it
     * closeOrder event will have the no retrun values
     * rest of the event object will look something like in the end of this example:
     * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34
     */
    async watchFundClosedEvent(callback) {
        //todo
        console.log('@todo watchFundClosedEvent');
        console.log(callback);
    }

    /**
     * Returns a list of investmentRecord-s in the order they have created -newInvestment (ethereum) event-,
     * the number of returned investmentRecord-s is limited by the limit parameter
     * @param {number} limit if 0, tries to return all, but can fail if there is too many
     *
     * @typedef investmentRecord
     *
     * @property {string} investor ethereum address of the investor
     * @property {number} amount amount of investment in wei
     *
     * @return {investmentRecord[]} list of investmentRecord-s
     */
    async getLatestInvestmentsFromEvents(fundAddress, latestNblocks) {
        const instance = await this.fund.at(fundAddress);
        // const instance = await this.registry.deployed();
        const instanceRawWeb3 = new this.web3.eth.Contract(instance.abi, instance.address);
        const blockNumber = await this.web3.eth.getBlockNumber();

        const fromBlock = latestNblocks === 0
            ? 0
            : blockNumber - latestNblocks;

        const logs = await PromisifyEvent(callback => instanceRawWeb3.getPastEvents('newInvestment', {
            fromBlock: fromBlock,
            toBlock: 'latest',
        }, callback));

        return logs.map(item => ({
            investor: item.returnValues.investor,
            amount: item.returnValues.amount
        }));
    }
}
