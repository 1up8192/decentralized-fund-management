## Functions

<dl>
<dt><a href="#addDex">addDex(name, adapterAddress)</a></dt>
<dd><p>Add a new dex (adapter contract has to be deployed first)</p>
</dd>
<dt><a href="#removeDex">removeDex(name)</a></dt>
<dd><p>Remove dex</p>
</dd>
<dt><a href="#getAdapterAddress">getAdapterAddress(name)</a></dt>
<dd><p>Get the address of the dex adapter contract (part of glaxis)</p>
</dd>
<dt><a href="#getDexAddress">getDexAddress(name)</a></dt>
<dd><p>Get the address of the dex endpoint interface contract (not part of glaxis, part of the dex system)</p>
</dd>
<dt><a href="#watchDexAddedEvent">watchDexAddedEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for newly added dex-es</p>
</dd>
<dt><a href="#watchDexRemovedEvent">watchDexRemovedEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for newly removed dex-es</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#dexRecord">dexRecord</a> ⇒ <code><a href="#dexRecord">Array.&lt;dexRecord&gt;</a></code></dt>
<dd><p>Returns a list of dexRecord-s in the order they have created -dexAdded (ethereum) event-, 
the number of returned dexRecord-s is limited by the limit parameter</p>
</dd>
</dl>

<a name="addDex"></a>

## addDex(name, adapterAddress)
Add a new dex (adapter contract has to be deployed first)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | dex name |
| adapterAddress | <code>string</code> | ethereum address of the adapter contract |

<a name="removeDex"></a>

## removeDex(name)
Remove dex

**Kind**: global function  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="getAdapterAddress"></a>

## getAdapterAddress(name)
Get the address of the dex adapter contract (part of glaxis)

**Kind**: global function  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="getDexAddress"></a>

## getDexAddress(name)
Get the address of the dex endpoint interface contract (not part of glaxis, part of the dex system)

**Kind**: global function  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="watchDexAddedEvent"></a>

## watchDexAddedEvent(callback)
(ethereum) Event watcher function for newly added dex-es

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it watchDexAddedEvent event will have the following retrun values: event.returnvalues: {  name,  adapterAddress } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="watchDexRemovedEvent"></a>

## watchDexRemovedEvent(callback)
(ethereum) Event watcher function for newly removed dex-es

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it watchDexRemovedEvent event will have the following retrun values: event.returnvalues: {  name } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="dexRecord"></a>

## dexRecord ⇒ [<code>Array.&lt;dexRecord&gt;</code>](#dexRecord)
Returns a list of dexRecord-s in the order they have created -dexAdded (ethereum) event-, 
the number of returned dexRecord-s is limited by the limit parameter

**Kind**: global typedef  
**Returns**: [<code>Array.&lt;dexRecord&gt;</code>](#dexRecord) - list of fundAddress-s  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | if 0, tries to return all, but can fail if there is too many |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | ethereum address of the investor |
| adapterAddress | <code>string</code> | amount of investment in wei |

