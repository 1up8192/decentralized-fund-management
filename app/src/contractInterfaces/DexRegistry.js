import TruffleContract from 'truffle-contract';
import dexRegistryArtifact from '../../../build/contracts/DexRegistry.json';
import promisifyEvent from '../utils/promisifyEvent';

export default class DexRegistry {
    constructor(provider, account, web3) {
      this.dexRegistry = TruffleContract(dexRegistryArtifact);
      this.dexRegistry.setProvider(provider);
      this.account = account;
      this.web3 = web3;
  }

  /**
   * Add a new dex (adapter contract has to be deployed first)
   * @param {string} name dex name
   * @param {string} adapterAddress ethereum address of the adapter contract
   */
  async addDex(name, adapterAddress) {
    const instance = await this.dexRegistry.deployed();
    return instance.addDex(name, adapterAddress, {from: this.account});
  }

  /**
   * Remove dex
   * @param {string} name 
   */
  async removeDex(name) {
    const instance = await this.dexRegistry.deployed();
    return instance.removeDex(name, {from: this.account});
  }

  /**
   * Get the address of the dex adapter contract (part of glaxis)
   * @param {string} name 
   */
  async getAdapterAddress(name) {
    const instance = await this.dexRegistry.deployed();
    return instance.getAdapterAddress.call(name, {from: this.account});
  }

  /**
   * Get the address of the dex endpoint interface contract (not part of glaxis, part of the dex system)
   * @param {string} name 
   */
  async getDexAddress(name) {
    //todo
  }

  /**
   * (ethereum) Event watcher function for newly added dex-es
   * @param {funtion} callback should have an event parameter to handle it
   * watchDexAddedEvent event will have the following retrun values:
   * event.returnvalues: {
   *  name,
   *  adapterAddress
   * }
   * rest of the event object will look something like in the end of this example:
   * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 
   */
  async watchDexAddedEvent(callback) {
    //todo
  }

  /**
   * (ethereum) Event watcher function for newly removed dex-es
   * @param {funtion} callback should have an event parameter to handle it
   * watchDexRemovedEvent event will have the following retrun values:
   * event.returnvalues: {
   *  name
   * }
   * rest of the event object will look something like in the end of this example:
   * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 
   */
  async watchDexRemovedEvent(callback) {
    //todo
  }

  /**
   * Returns a list of dexRecord-s in the order they have created -dexAdded (ethereum) event-, 
   * the number of returned dexRecord-s is limited by the limit parameter
   * @param {number} limit if 0, tries to return all, but can fail if there is too many
   * 
   * @typedef dexRecord
   * 
   * @property {string} name ethereum address of the investor
   * @property {string} adapterAddress amount of investment in wei
   * 
   * @return {dexRecord[]} list of fundAddress-s
   */
  async getLatestDexesFromEvents(limit) {
    //todo
  }

}