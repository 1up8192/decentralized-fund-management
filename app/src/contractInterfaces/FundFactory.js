import TruffleContract from 'truffle-contract';
import fundFactoryArtifact from '../../../build/contracts/FundFactory.json';
import PromisifyEvent from '../utils/promisifyEvent';

export default class FundFactory {
    /**
     * @param provider
     * @param account
     * @param web3
     */
    constructor(provider, account, web3) {
        this.fundFactory = TruffleContract(fundFactoryArtifact);
        this.fundFactory.setProvider(provider);
        this.account = account;
        this.web3 = web3;
    }

    /**
     * Transaction to initiate the creation of a new fund
     * //LATER@param {number} profitShare % value, .000 resolution: 1 = 0.001%, 1000 = 1%, 100000 = 100%
     * //LATER@param {number} stopLossPercent % value, .000 resolution: 1 = 0.001%, 1000 = 1%, 100000 = 100%
     *
     * @param {number} startTime unix timestamp
     * @param {number} endTime unix timestamp
     * @param {number} globalTraderLimit // if 0: unlimited
     * @param {number} investMin
     * @param {number} investMax // if 0: unlimited
     * @param {string[]} traderList list of trader addresses
     * @param {number[]} limitList has to be same length as trader list, if unlimited, 0
     */

    async createFund(startTime, endTime, globalTraderLimit, investMin, investMax, traderList, limitList) {
        const instance = await this.fundFactory.deployed();

        return instance.createFund(startTime, endTime, globalTraderLimit, investMin, investMax, traderList, limitList, {from: this.account});
    }

    /**
     * Check if a fund exists
     *
     * @param {string} fundAddress ethereum address
     * @return {boolean}
     */
    async checkFund(fundAddress) {
        //todo
        console.log('@todo checkFund');
        console.log(fundAddress);
    }

    /**
     * (ethereum) Event watcher function for newly created funds
     * @param {funtion} callback should have an event parameter to handle it
     * createFund event will have the following retrun values:
     * event.returnvalues: {
     *  fundAddress,
     * }
     * rest of the event object will look something like in the end of this example:
     * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34
     */
    async watchFundCreatedEvent(callback) {
        const instance = await this.fundFactory.deployed();
        const instanceRawWeb3 = new this.web3.eth.Contract(instance.abi, instance.address);

        instanceRawWeb3.events.fundCreated({fromBlock: 0, toBlock: 'latest'}).on('data', callback);
    }

    /**
     * Returns a list of fundAddress-es of orders in the order they have created -createFund (ethereum) event-,
     * the number of returned fundAddress-es is limited by the limit parameter
     *
     * @param {number} limit if 0, tries to return all, but can fail if there is too many
     *
     * @return {string[]} list of fundAddress-s
     */
    async getLatestFundsFromEvents(latestNblocks) {
        const instance = await this.fundFactory.deployed();
        const instanceRawWeb3 = new this.web3.eth.Contract(instance.abi, instance.address);
        const blockNumber = await this.web3.eth.getBlockNumber();

        const fromBlock = latestNblocks === 0
            ? 0
            : blockNumber - latestNblocks;

        const logs = await PromisifyEvent(callback => instanceRawWeb3.getPastEvents('fundCreated', {
            fromBlock: fromBlock,
            toBlock: 'latest',
        }, callback));

        return logs.map(item => item.returnValues.fundAddress);
    }

    /**
     * Returns a list of fundAddress-es of orders in the order they have created -createFund (ethereum) event-,
     *
     * @return {string[]} list of fundAddress-s
     */
    async getAllFundsFromEvents() {
        const instance = await this.fundFactory.deployed();
        const instanceRawWeb3 = new this.web3.eth.Contract(instance.abi, instance.address);

        const logs = await PromisifyEvent(callback => instanceRawWeb3.getPastEvents('fundCreated', {
            fromBlock: 0,
            toBlock: 'latest',
        }, callback));

        return logs.map(item => item.returnValues.fundAddress);
    }
}
