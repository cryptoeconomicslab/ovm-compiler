pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

interface AtomicPredicate {
    function decideTrue(bytes[] calldata _inputs) external;
    function decide(bytes[] calldata _inputs) external view returns (bool);
}
