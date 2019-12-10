## Functions

<dl>
<dt><a href="#invest">invest(amount)</a></dt>
<dd><p>Make a new investment in the fund - for end users</p>
</dd>
<dt><a href="#withdraw">withdraw()</a></dt>
<dd><p>Withdraw all investments from the fund - for end users</p>
</dd>
<dt><a href="#trade">trade(from, to, fromAmount, toAmount)</a></dt>
<dd><p>for fund managers
Initiate a new trade directive trough Orders (can manifest in making a new order or closing an existing one)
If from address is an erc20 token, approval must happen first 
(DEX endpoint contract must be approved of taking the needed amount of erc20 token: approveERC20 functions)</p>
</dd>
<dt><a href="#closeFund">closeFund()</a></dt>
<dd><p>for fund managers
close every order and close fund</p>
</dd>
<dt><a href="#approveERC20">approveERC20(token, amount, dex)</a></dt>
<dd><p>before erc20 trade DEX endpoint contract must be approved of taking the needed amount of erc20 token</p>
</dd>
<dt><a href="#watchNewInvestmentEvent">watchNewInvestmentEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for new investments</p>
</dd>
<dt><a href="#watchNewWithdrawalEvent">watchNewWithdrawalEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for new withdrawals</p>
</dd>
<dt><a href="#watchStopLossTriggeredEvent">watchStopLossTriggeredEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for stop loss trigger</p>
</dd>
<dt><a href="#watchFundClosedEvent">watchFundClosedEvent(callback)</a></dt>
<dd><p>(ethereum) Event watcher function for fund closed event</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#investmentRecord">investmentRecord</a> ⇒ <code><a href="#investmentRecord">Array.&lt;investmentRecord&gt;</a></code></dt>
<dd><p>Returns a list of investmentRecord-s in the order they have created -newInvestment (ethereum) event-, 
the number of returned investmentRecord-s is limited by the limit parameter</p>
</dd>
</dl>

<a name="invest"></a>

## invest(amount)
Make a new investment in the fund - for end users

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | amount of investment in wei |

<a name="withdraw"></a>

## withdraw()
Withdraw all investments from the fund - for end users

**Kind**: global function  
<a name="trade"></a>

## trade(from, to, fromAmount, toAmount)
for fund managers
Initiate a new trade directive trough Orders (can manifest in making a new order or closing an existing one)
If from address is an erc20 token, approval must happen first 
(DEX endpoint contract must be approved of taking the needed amount of erc20 token: approveERC20 functions)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | ethereum address of erc20 token or 0x0...0 if ETH |
| to | <code>stirng</code> | ethereum address of erc20 token or 0x0...0 if ETH |
| fromAmount | <code>number</code> |  |
| toAmount | <code>number</code> |  |

<a name="closeFund"></a>

## closeFund()
for fund managers
close every order and close fund

**Kind**: global function  
<a name="approveERC20"></a>

## approveERC20(token, amount, dex)
before erc20 trade DEX endpoint contract must be approved of taking the needed amount of erc20 token

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | ethereum address of the token contract |
| amount | <code>number</code> | amount of token in wei to approve of, should be same as the from amount of the trade |
| dex | <code>string</code> | indentifier of the dex to find it in dex registry |

<a name="watchNewInvestmentEvent"></a>

## watchNewInvestmentEvent(callback)
(ethereum) Event watcher function for new investments

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it newInvestment event will have the following retrun values: event.returnvalues: {  investor, -address string  amount -number in wei } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="watchNewWithdrawalEvent"></a>

## watchNewWithdrawalEvent(callback)
(ethereum) Event watcher function for new withdrawals

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it newWithdrawal event will have the following retrun values: event.returnvalues: {  investor, -address string  amount -number in wei } rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="watchStopLossTriggeredEvent"></a>

## watchStopLossTriggeredEvent(callback)
(ethereum) Event watcher function for stop loss trigger

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it stopLossTriggered event will have the no retrun values rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="watchFundClosedEvent"></a>

## watchFundClosedEvent(callback)
(ethereum) Event watcher function for fund closed event

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>funtion</code> | should have an event parameter to handle it closeOrder event will have the no retrun values rest of the event object will look something like in the end of this example: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id34 |

<a name="investmentRecord"></a>

## investmentRecord ⇒ [<code>Array.&lt;investmentRecord&gt;</code>](#investmentRecord)
Returns a list of investmentRecord-s in the order they have created -newInvestment (ethereum) event-, 
the number of returned investmentRecord-s is limited by the limit parameter

**Kind**: global typedef  
**Returns**: [<code>Array.&lt;investmentRecord&gt;</code>](#investmentRecord) - list of fundAddress-s  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> | if 0, tries to return all, but can fail if there is too many |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| investor | <code>string</code> | ethereum address of the investor |
| amount | <code>number</code> | amount of investment in wei |

