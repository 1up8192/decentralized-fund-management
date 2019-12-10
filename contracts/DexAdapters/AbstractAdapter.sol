pragma solidity ^0.5.6;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../CommonInternalDexInterface.sol";

contract AbstractAdapter is CommonInternalDexInterface, Ownable {

    address public dexAddress;
    bool public enabled;
    address constant public ETH_ADDRESS = 0x0000000000000000000000000000000000000000;

    event DexAddressChanged(address dexAddress);
    event AdapterDisabled();
    event AdapterEnabled();

    constructor (address _dexAddress, bool _enabled) public {
        dexAddress = _dexAddress;
        enabled = _enabled;
        emit DexAddressChanged(_dexAddress);
        if (_enabled) {
            emit AdapterEnabled();
        } else {
            emit AdapterDisabled();
        }
    }

    function changeDexAddress (address _dexAddress) public onlyOwner {
        dexAddress = _dexAddress;
        emit DexAddressChanged(_dexAddress);
    }

    function enableAdapter () public onlyOwner {
        enabled = true;
        emit AdapterEnabled();
    }

    function disableAdapter () public onlyOwner {
        enabled = false;
        emit AdapterDisabled();
    }

    function getDexAddress() public view returns (address){
        return dexAddress;
    }

    function makeOrder(address _dexAddress, address tokenToSell, uint amountToSell, address tokenToBuy, uint rate) external returns (uint);
    function takeOrder(address _dexAddress, address tokenToSell, uint256 amountToSell, address tokenToBuy) external returns (uint);
    function getRate(address tokenToSell, uint amountToSell, address tokenToBuy) external view returns (uint);

    function () external {
        revert("fallback");
    }

}
