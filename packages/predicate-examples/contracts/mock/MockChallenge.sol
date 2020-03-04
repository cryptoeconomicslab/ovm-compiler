pragma solidity ^0.5.3;
pragma experimental ABIEncoderV2;

import '../predicate/LogicalConnective.sol';

contract MockChallenge {
    constructor() public {}

    function isValidChallenge(
        types.Property memory _property,
        bytes[] memory _challengeInputs,
        types.Property memory _child
    ) public view returns (bool) {
        return
            LogicalConnective(_property.predicateAddress).isValidChallenge(
                _property.inputs,
                _challengeInputs,
                _child
            );
    }
}
