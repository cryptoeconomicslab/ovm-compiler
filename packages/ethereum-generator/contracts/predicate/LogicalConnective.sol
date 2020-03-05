pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import {DataTypes as types} from '../DataTypes.sol';

interface LogicalConnective {
    function isValidChallenge(
        bytes[] calldata _inputs,
        bytes[] calldata _challengeInputs,
        types.Property calldata _challenge
    ) external view returns (bool);
}
