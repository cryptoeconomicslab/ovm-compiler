pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import { DataTypes as types } from "ovm-contracts/DataTypes.sol";
import "ovm-contracts/UniversalAdjudicationContract.sol";
import "ovm-contracts/Utils.sol";
import "ovm-contracts/Predicate/AtomicPredicate.sol";
import "ovm-contracts/Predicate/CompiledPredicate.sol";


/**
 * OrTest(a,b)
 */
contract OrTest {
    bytes public OrTestO = bytes("OrTestO");

    UniversalAdjudicationContract adjudicationContract;
    Utils utils;
    address IsLessThan = address(0x0000000000000000000000000000000000000000);
    address Equal = address(0x0000000000000000000000000000000000000000);
    address IsValidSignature = address(0x0000000000000000000000000000000000000000);
    address IsContained = address(0x0000000000000000000000000000000000000000);
    address VerifyInclusion = address(0x0000000000000000000000000000000000000000);
    address IsSameAmount = address(0x0000000000000000000000000000000000000000);
    address notAddress = address(0x0000000000000000000000000000000000000000);
    address andAddress = address(0x0000000000000000000000000000000000000000);
    address forAllSuchThatAddress = address(0x0000000000000000000000000000000000000000);
    address payoutCountractAddress;
    bool isInitialized = false;

    constructor(
        address _adjudicationContractAddress,
        address _utilsAddress,
        address _notAddress,
        address _andAddress,
        address _forAllSuchThatAddress
    ) public {
        adjudicationContract = UniversalAdjudicationContract(_adjudicationContractAddress);
        utils = Utils(_utilsAddress);
        notAddress = _notAddress;
        andAddress = _andAddress;
        forAllSuchThatAddress = _forAllSuchThatAddress;
    }

    function setPredicateAddresses(
        address _isLessThan,
        address _equal,
        address _isValidSignature,
        address _isContained,
        address _verifyInclusion,
        address _isSameAmount,
        address _payoutCountractAddress
    ) public {
        require(!isInitialized, "isInitialized must be false");
        IsLessThan = _isLessThan;
        Equal = _equal;
        IsValidSignature = _isValidSignature;
        IsContained = _isContained;
        VerifyInclusion = _verifyInclusion;
        IsSameAmount = _isSameAmount;
        payoutCountractAddress = _payoutCountractAddress;
        isInitialized = true;
    }

    /**
     * @dev Validates a child node of the property in game tree.
     */
    function isValidChallenge(
        bytes[] memory _inputs,
        bytes[] memory _challengeInput,
        types.Property memory _challenge
    ) public returns (bool) {
        require(
            keccak256(abi.encode(getChild(_inputs, _challengeInput))) == keccak256(abi.encode(_challenge)),
            "_challenge must be valud child of game tree"
        );
        return true;
    }

    function getChild(
        bytes[] memory inputs,
        bytes[] memory challengeInput
    ) private returns (types.Property memory) {
        bytes32 input0 = keccak256(inputs[0]);
        if(input0 == keccak256(OrTestO)) {
            return getChildOrTestO(inputs, challengeInput);
        }
        return getChildOrTestO(utils.subArray(inputs, 1, inputs.length), challengeInput);
    }

    /**
     * @dev check the property is true
     */
    function decide(bytes[] memory _inputs, bytes[] memory _witness) public view returns(bool) {
        bytes32 input0 = keccak256(_inputs[0]);
        if(input0 == keccak256(OrTestO)) {
            return decideOrTestO(_inputs, _witness);
        }
        return decideOrTestO(utils.subArray(_inputs, 1, _inputs.length), _witness);
    }

    function decideTrue(bytes[] memory _inputs, bytes[] memory _witness) public {
        require(decide(_inputs, _witness), "must be true");
        types.Property memory property = types.Property({
            predicateAddress: address(this),
            inputs: _inputs
        });
        adjudicationContract.setPredicateDecision(utils.getPropertyId(property), true);
    }

    /**
     * Gets child of OrTestO(OrTestO,a,b).
     */
    function getChildOrTestO(bytes[] memory _inputs, bytes[] memory challengeInputs) private returns (types.Property memory) {

        bytes[] memory andInputs = new bytes[](2);
        bytes[] memory notInputs0 = new bytes[](1);
        bytes[] memory childInputsOf0 = new bytes[](1);
        childInputsOf0[0] = _inputs[1];

        notInputs0[0] = abi.encode(types.Property({
            predicateAddress: Foo,
            inputs: childInputsOf0
        }));

        andInputs[0] = abi.encode(types.Property({
            predicateAddress: notAddress,
            inputs: notInputs0
        }));
        bytes[] memory notInputs1 = new bytes[](1);
        bytes[] memory childInputsOf1 = new bytes[](1);
        childInputsOf1[0] = _inputs[2];

        notInputs1[0] = abi.encode(types.Property({
            predicateAddress: Bar,
            inputs: childInputsOf1
        }));

        andInputs[1] = abi.encode(types.Property({
            predicateAddress: notAddress,
            inputs: notInputs1
        }));
        return types.Property({
            predicateAddress: andAddress,
            inputs: andInputs
        });
    }
    /**
     * Decides OrTestO(OrTestO,a,b).
     */
    function decideOrTestO(bytes[] memory _inputs, bytes[] memory _witness) public view returns (bool) {
        // check Or
        uint256 orIndex = abi.decode(_witness[0], (uint256));
        if(orIndex == 0) {

            bytes[] memory childInputs0 = new bytes[](1);
            childInputs0[0] = _inputs[1];
            require(AtomicPredicate(Foo).decide(childInputs0));

        }
        if(orIndex == 1) {

            bytes[] memory childInputs1 = new bytes[](1);
            childInputs1[0] = _inputs[2];
            require(AtomicPredicate(Bar).decide(childInputs1));

        }
        return true;
    }

}

