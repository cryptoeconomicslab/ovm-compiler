    /**
     * Gets child of ForValTestF(ForValTestF,a).
     */
    function getChildForValTestF(bytes[] memory _inputs, bytes[] memory challengeInputs) private view returns (types.Property memory) {
        bytes[] memory notInputs = new bytes[](1);
        notInputs[0] = challengeInputs[0];
        return types.Property({
            predicateAddress: notAddress,
            inputs: notInputs
        });
    }
