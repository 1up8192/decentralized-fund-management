import TruffleContract from 'truffle-contract';
import ordersArtifact from '../../../build/contracts/Orders.json';
import promisifyEvent from '../../utils/promisifyEvent';

export default class Orders {
    constructor(provider, account, web3) {
      this.orders = TruffleContract(ordersArtifact);
      this.orders.setProvider(provider);
      this.account = account;
      this.web3 = web3;
  }

  /**
   * Gets all parameters of an order specified by an orderID
   * @param {string} orderID 
   * 
   * @typedef {Object} OrderParams
   * 
   * @property {string} status
   * @property {number} fromAmount
   * @property {number} toAmount
   * @property {number} returnAmount
   * @property {number} stopLossPrice
   * @property {string} fromToken
   * @property {string} toToken
   * @property {string} exchange
   * @property {string} fund
   * @property {string} trader
   * 
   * @return {OrderParams}
   */
  async getOrder(orderID) {
    const instance = await this.orders.deployed();
    const result = await instance.orders.call(orderID, { from: this.account });

    return {
      status: result[0],
      baseAmount: result[1],
      exchangeAmount: result[2],
      returnAmount: result[3],
      stopLossPrice: result[4],
      previousAmountForVerfication: result[5],
      tradeTime: result[6],
      baseToken: result[7],
      exchangeToken: result[8],
      exchange: result[9],
      fund: result[10],
      trader: result[11]
    }
  }

  /**
   * (ethereum) Event watcher function for newly opened orders
   * @param {funtion} callback should have an event parameter to handle it
   * openOrder event will have the following retrun values:
   * event.returnvalues: {
   *  orderId,
   * }
   * rest of the event object will look something like in the end of this example:
   * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34
   */
  async watchOpenOrderEvent(callback){
    //todo
  }

  /**
   * (ethereum) Event watcher function for newly closed orders
   * @param {funtion} callback should have an event parameter to handle it
   * closeOrder event will have the following retrun values:
   * event.returnvalues: {
   *  orderId,
   * }
   * rest of the event object will look something like in the end of this example:
   * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 
   */
  async watchcloseOrderEvent(callback){
    //todo
  }

  /**
   * Returns a list of orderID-s of all orders that have an open order (ethereum) event, 
   * but doesn't have a close order (ethereum) event
   * @return {number[]} list of orderID-s
   */
  async getAllOpenOrdersFromEvents(){
    //todo
  }

  /**
   * Returns a list of orderID-s of orders in the order they have been opened -open order (ethereum) event-, 
   * the number of returned orderID-s is limited by the limit parameter
   * @param {number} limit if 0, tries to return all, but can fail if there is too many
   * @return {number[]} list of orderID-s
   */
  async getLatestOrdersFromEvents(limit){
    //todo
  }

  asyncGetOrdersByFundFromEvents(fundAddress){
    
  }

}