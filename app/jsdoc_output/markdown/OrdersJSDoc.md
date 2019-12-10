## Functions

<dl>
<dt><a href="#watchOpenOrderEvent">watchOpenOrderEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for newly opened orders</p>
</dd>
<dt><a href="#watchcloseOrderEvent">watchcloseOrderEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for newly closed orders</p>
</dd>
<dt><a href="#getAllOpenOrdersFromEvents">getAllOpenOrdersFromEvents()</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Returns a list of orderID-s of all orders that have an open order (ethereum) event, 
but doesn&#39;t have a close order (ethereum) event</p>
</dd>
<dt><a href="#getLatestOrdersFromEvents">getLatestOrdersFromEvents(limit)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Returns a list of orderID-s of orders in the order they have been opened -open order (ethereum) event-, 
the number of returned orderID-s is limited by the limit parameter</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#OrderParams">OrderParams</a> ⇒ <code><a href="#OrderParams">OrderParams</a></code></dt>
<dd><p>Gets all parameters of an order specified by an orderID</p>
</dd>
</dl>

<a name="watchOpenOrderEvent"></a>

## watchOpenOrderEvent(callback)
(ethereum) Event watcher function for newly opened orders

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it openOrder event will have the following retrun values: event.returnvalues: {  orderId, } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="watchcloseOrderEvent"></a>

## watchcloseOrderEvent(callback)
(ethereum) Event watcher function for newly closed orders

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it closeOrder event will have the following retrun values: event.returnvalues: {  orderId, } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="getAllOpenOrdersFromEvents"></a>

## getAllOpenOrdersFromEvents() ⇒ <code>Array.&lt;number&gt;</code>
Returns a list of orderID-s of all orders that have an open order (ethereum) event, 
but doesn't have a close order (ethereum) event

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - list of orderID-s  
<a name="getLatestOrdersFromEvents"></a>

## getLatestOrdersFromEvents(limit) ⇒ <code>Array.&lt;number&gt;</code>
Returns a list of orderID-s of orders in the order they have been opened -open order (ethereum) event-, 
the number of returned orderID-s is limited by the limit parameter

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - list of orderID-s  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | if 0, tries to return all, but can fail if there is too many |

<a name="OrderParams"></a>

## OrderParams ⇒ [<code>OrderParams</code>](#OrderParams)
Gets all parameters of an order specified by an orderID

**Kind**: global typedef  

| Param | Type |
| --- | --- |
| orderID | <code>\*</code> | 

**Properties**

| Name | Type |
| --- | --- |
| status | <code>string</code> | 
| fromAmount | <code>number</code> | 
| toAmount | <code>number</code> | 
| returnAmount | <code>number</code> | 
| stopLossPrice | <code>number</code> | 
| fromToken | <code>string</code> | 
| toToken | <code>string</code> | 
| exchange | <code>string</code> | 
| fund | <code>string</code> | 
| trader | <code>string</code> | 

