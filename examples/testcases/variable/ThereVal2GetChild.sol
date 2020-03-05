    /**
     * Gets child of ThereValTestT(ThereValTestT,a).
     */
    function getChildThereValTestT(bytes[] memory _inputs, bytes[] memory challengeInputs) private view returns (types.Property memory) {
        bytes[] memory forAllSuchThatInputs = new bytes[](3);
        bytes[] memory notInputs = new bytes[](1);
        types.Property memory inputPredicateProperty = abi.decode(_inputs[0], (types.Property));
        bytes[] memory childInputsOf = new bytes[](inputPredicateProperty.inputs.length + 1);
        for(uint256 i = 0;i < inputPredicateProperty.inputs.length;i++) {
            childInputsOf[i] = inputPredicateProperty.inputs[i];
        }
        childInputsOf[inputPredicateProperty.inputs.length] = challengeInputs[0];
        notInputs[0] = abi.encode(types.Property({
            predicateAddress: inputPredicateProperty.predicateAddress,
            inputs: childInputsOf
        }));
        forAllSuchThatInputs[0] = bytes("");
        forAllSuchThatInputs[1] = bytes("b");
        forAllSuchThatInputs[2] = abi.encode(types.Property({
            predicateAddress: notAddress,
            inputs: notInputs
        }));
        return types.Property({
            predicateAddress: forAllSuchThatAddress,
            inputs: forAllSuchThatInputs
        });
    }
