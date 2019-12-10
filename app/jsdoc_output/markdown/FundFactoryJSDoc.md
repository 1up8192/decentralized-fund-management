## Functions

<dl>
<dt><a href="#createFund">createFund(profitShare, stopLossPercent, startTime, endTime)</a></dt>
<dd><p>Transaction to initiate the creation of a new fund</p>
</dd>
<dt><a href="#checkFund">checkFund(fundAddress)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a fund exists</p>
</dd>
<dt><a href="#watchFundCreatedEvent">watchFundCreatedEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for newly created funds</p>
</dd>
<dt><a href="#getLatestFundsFromEvents">getLatestFundsFromEvents(limit)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Returns a list of fundAddress-es of orders in the order they have created -createFund (ethereum) event-, 
the number of returned fundAddress-es is limited by the limit parameter</p>
</dd>
</dl>

<a name="createFund"></a>

## createFund(profitShare, stopLossPercent, startTime, endTime)
Transaction to initiate the creation of a new fund

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| profitShare | <code>number</code> | % value, .000 resolution: 1 = 0.001%, 1000 = 1%, 100000 = 100% |
| stopLossPercent | <code>number</code> | % value, .000 resolution: 1 = 0.001%, 1000 = 1%, 100000 = 100% |
| startTime | <code>number</code> | unix timestamp |
| endTime | <code>number</code> | unix timestamp |

<a name="checkFund"></a>

## checkFund(fundAddress) ⇒ <code>boolean</code>
Check if a fund exists

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| fundAddress | <code>string</code> | ethereum address |

<a name="watchFundCreatedEvent"></a>

## watchFundCreatedEvent(callback)
(ethereum) Event watcher function for newly created funds

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it createFund event will have the following retrun values: event.returnvalues: {  fundAddress, } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="getLatestFundsFromEvents"></a>

## getLatestFundsFromEvents(limit) ⇒ <code>Array.&lt;string&gt;</code>
Returns a list of fundAddress-es of orders in the order they have created -createFund (ethereum) event-, 
the number of returned fundAddress-es is limited by the limit parameter

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - list of fundAddress-s  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | if 0, tries to return all, but can fail if there is too many |

