    /**
     * Gets child of BindAddrTestA(BindAddrTestA,a).
     */
    function getChildBindAddrTestA(bytes[] memory _inputs, bytes[] memory challengeInputs) private returns (types.Property memory) {
        types.Property memory inputProperty1 = abi.decode(_inputs[0], (types.Property));
        uint256 challengeInput = utils.bytesToUint(challengeInputs[0]);
        bytes[] memory notInputs = new bytes[](1);
        if(challengeInput == 0) {
            bytes[] memory childInputsOf0 = new bytes[](2);
            childInputsOf0[0] = abi.encodePacked(inputProperty1.predicateAddress);
            childInputsOf0[1] = abi.encodePacked(address(self));

            notInputs[0] = abi.encode(types.Property({
                predicateAddress: Equal,
                inputs: childInputsOf0
            }));

        }
        if(challengeInput == 1) {
            bytes[] memory childInputsOf1 = new bytes[](1);
            childInputsOf1[0] = inputProperty1.inputs[0];

            notInputs[0] = abi.encode(types.Property({
                predicateAddress: Bar,
                inputs: childInputsOf1
            }));

        }
        return types.Property({
            predicateAddress: notAddress,
            inputs: notInputs
        });
    }
