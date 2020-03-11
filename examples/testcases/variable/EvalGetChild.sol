    /**
     * Gets child of EvalTestA(EvalTestA,a,b).
     */
    function getChildEvalTestA(bytes[] memory _inputs, bytes[] memory challengeInputs) private view returns (types.Property memory) {
        uint256 challengeInput = abi.decode(challengeInputs[0], (uint256));
        bytes[] memory notInputs = new bytes[](1);
        if(challengeInput == 0) {
            bytes[] memory childInputsOf0 = new bytes[](1);
            childInputsOf0[0] = _inputs[0];

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
            notInputs[0] = _inputs[1];
            return types.Property({
                predicateAddress: notAddress,
                inputs: notInputs
            });
        }
    }
