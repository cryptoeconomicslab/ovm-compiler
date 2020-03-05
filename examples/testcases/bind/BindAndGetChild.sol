    /**
     * Gets child of BindAndTestA(BindAndTestA,a).
     */
    function getChildBindAndTestA(bytes[] memory _inputs, bytes[] memory challengeInputs) private view returns (types.Property memory) {
        types.Property memory inputProperty1 = abi.decode(_inputs[0], (types.Property));
        uint256 challengeInput = abi.decode(challengeInputs[0], (uint256));
        bytes[] memory notInputs = new bytes[](1);
        if(challengeInput == 0) {
            bytes[] memory childInputsOf0 = new bytes[](1);
            childInputsOf0[0] = inputProperty1.inputs[0];

            notInputs[0] = abi.encode(types.Property({
                predicateAddress: Foo,
                inputs: childInputsOf0
            }));

            return types.Property({
                predicateAddress: notAddress,
                inputs: notInputs
            });
        }
        if(challengeInput == 1) {
            bytes[] memory childInputsOf1 = new bytes[](1);
            childInputsOf1[0] = inputProperty1.inputs[1];

            notInputs[0] = abi.encode(types.Property({
                predicateAddress: Bar,
                inputs: childInputsOf1
            }));

            return types.Property({
                predicateAddress: notAddress,
                inputs: notInputs
            });
        }
    }
