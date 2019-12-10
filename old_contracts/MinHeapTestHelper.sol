pragma solidity ^0.4.11;
import "./MinHeap.sol";

contract MinHeapTestHelper{
    MinHeap.Heap heap;

    function parent(uint i) public constant returns (uint){
        return MinHeap.parent(i);
    }

    function leftChild(uint i) public constant returns (uint){
        return MinHeap.leftChild(i);
    }

    function rightChild(uint i) public constant returns (uint){
        return MinHeap.rightChild(i);
    }

    function min() public constant returns (uint){
        return MinHeap.min(heap);
    }

    function insert(uint n) public {
        MinHeap.insert(heap, n);
    }

    function remove(uint i) public {
        MinHeap.remove(heap, i);
    }

    function removeNumber(uint n) public {
        MinHeap.removeNumber(heap, n);
    }

    function findIndex(uint n) public constant returns (uint){
        return MinHeap.findIndex(heap, n);
    }

    function sinkDown(uint i) public {
        MinHeap.sinkDown(heap, i);
    }

    function bubbleUp() public {
        MinHeap.bubbleUp(heap);
    }

    function swapWithParent(uint i) public {
        MinHeap.swapWithParent(heap, i);
    }

    function smallestOf3(uint i) public constant returns (uint){
        return MinHeap.smallestOf3(heap, i);
    }
}
