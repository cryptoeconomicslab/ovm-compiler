    /**
     * Gets child of EvalTestA(EvalTestA,a,b).
     */
    function getChildEvalTestA(bytes[] memory _inputs, bytes[] memory challengeInputs) private returns (types.Property memory) {
        uint256 challengeInput = utils.bytesToUint(challengeInputs[0]);
        bytes[] memory notInputs = new bytes[](1);
        if(challengeInput == 0) {
            bytes[] memory childInputsOf0 = new bytes[](1);
            childInputsOf0[0] = _inputs[1];

            notInputs[0] = abi.encode(types.Property({
                predicateAddress: Foo,
                inputs: childInputsOf0
            }));

        }
        if(challengeInput == 1) {
            notInputs[0] = _inputs[2];
        }
        return types.Property({
            predicateAddress: notAddress,
            inputs: notInputs
        });
    }
