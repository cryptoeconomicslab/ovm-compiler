    /**
     * Gets child of BindValTestT(BindValTestT,a).
     */
    function getChildBindValTestT(bytes[] memory _inputs, bytes[] memory challengeInputs) private view returns (types.Property memory) {
        bytes[] memory forAllSuchThatInputs = new bytes[](3);
        bytes[] memory notInputs = new bytes[](1);
        bytes[] memory childInputsOf = new bytes[](2);
        childInputsOf[0] = bytes("Vb");
        childInputsOf[1] = _inputs[0];

        notInputs[0] = abi.encode(types.Property({
            predicateAddress: Foo,
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
