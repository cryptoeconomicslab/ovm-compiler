const text = "pragma solidity ^0.5.0;\npragma experimental ABIEncoderV2;\n\nimport {DataTypes as types} from \"../DataTypes.sol\";\nimport \"../UniversalAdjudicationContract.sol\";\nimport \"./AtomicPredicate.sol\";\nimport \"./NotPredicate.sol\";\n<%\nfunction getInputs(item, witnessName, doesWitnessExist) {\n  let str = \"\"\n  if(item.isCompiled) {\n    str += item.definition.name + ', '\n  }\n  for(var k=0;k < item.inputs.length;k++) {\n    const input = item.inputs[k]\n    if(input.type == 'NormalInput') {\n      str += \"_inputs[\" + (input.inputIndex) + \"]\"\n    } else {\n      str += witnessName || \"challengeInput\"\n    }\n    if(k < item.inputs.length - 1) {\n      str += \",\"\n    }\n  }\n  if(doesWitnessExist) {\n    if (str.length == 0) {\n      str += witnessName\n    } else {\n      str += ', ' + witnessName\n    }\n  }\n  return str\n}\nfunction isValidChallenge(predicate) {\n  return (\n    predicate == 'ForAllSuchThat' ||\n    predicate == 'Not' ||\n    predicate == 'And'\n  )\n}\n\nfunction getEncodedProperty(innerProperty) {\n  if(innerProperty.predicate.type == 'InputPredicate') {\n    return '_inputs[' + innerProperty.predicate.source.inputIndex + ']'\n  } else if(innerProperty.predicate.type == 'VariablePredicate') {\n    return 'challengeInput'\n  } else {\n    return 'abi.encode(type.Property({'\n      + 'predicateAddress: ' + (innerProperty.isCompiled ? 'address(this)' : innerProperty.predicate.source) + ','\n      + 'inputs: [' + getInputs(innerProperty) + ']'\n    + '}))'\n  }\n}\n\n%>\n\n<%\n  for(let c = 0;c < compiledPredicates.length;c++) {\n    const claimDef = compiledPredicates[c]\n%>\n/**\n * <%= claimDef.name %>(<%= claimDef.inputDefs %>)\n */\ncontract <%= claimDef.name %> {\n  <%\n  for(var i = 0;i < claimDef.contracts.length;i++) {\n    let property = claimDef.contracts[i]\n  %>\n    bytes32 public <%= property.definition.name %>;\n  <%\n  }\n  %>\n    UniversalAdjudicationContract AdjudicationContract;\n    AtomicPredicate SU;\n    AtomicPredicate LessThan;\n    AtomicPredicate eval;\n    AtomicPredicate Bytes;\n    AtomicPredicate SameRange;\n    AtomicPredicate IsValidSignature;\n    NotPredicate Not;\n    constructor(address _adjudicationContractAddress) {\n      AdjudicationContract = UniversalAdjudicationContract(_adjudicationContractAddress);\n      <%\n      for(var i = 0;i < claimDef.contracts.length;i++) {\n        let property = claimDef.contracts[i]\n      %>\n      <%= property.definition.name %> = keccak256(\"<%= property.definition.name %>\");\n      <% } %>\n    }\n    /**\n    * @dev Validates a child node of the property in game tree.\n    */\n    function isValidChallenge(\n        bytes[] memory _inputs,\n        bytes memory _challengeInput,\n        types.Property memory _challenge\n    ) public returns (bool) {\n        require(\n          keccak256(abi.encode(getChild(_inputs, _challengeInput))) == keccak256(abi.encode(_challenge)),\n          \"_challenge must be valud child of game tree\"\n        );\n        return true;\n    }\n\n    function getChild(bytes[] memory inputs, bytes memory challengeInput) private returns (types.Property memory) {\n      bytes32 input0 = bytesToBytes32(inputs[0]);\n      <%\n      for(var i = 0;i < claimDef.contracts.length;i++) {\n        let property = claimDef.contracts[i]\n      %>\n        <% if(isValidChallenge(property.definition.predicate)) { %>\n        if(input0 == <%= property.definition.name %>) {\n          return getChild<%= property.definition.name %>(inputs, challengeInput);\n        }<%}%><%}%>\n    }\n\n  /**\n   * @dev check the property is true\n   */\n  function decideTrue(bytes[] memory _inputs, bytes memory _witness) public {\n    bytes32 input0 = bytesToBytes32(_inputs[0]);\n    <%\n    for(var i = 0;i < claimDef.contracts.length;i++) {\n      let property = claimDef.contracts[i]\n    %>\n    if(input0 == <%= property.definition.name %>) {\n      decideTrue<%= property.definition.name %>(_inputs, _witness);\n    }\n    <%\n    }\n    %>\n  }\n\n  <%\n  for(var i = 0;i < claimDef.contracts.length;i++) {\n    let property = claimDef.contracts[i]\n  %>\n  <% if(isValidChallenge(property.definition.predicate)) { %>\n    /**\n     * Gets child of <%= property.definition.name %>(<%= property.inputDefs %>).\n     */\n    function getChild<%= property.definition.name %>(bytes[] memory _inputs, bytes memory challengeInput) private returns (types.Property memory) {\n      <% if(property.definition.predicate == 'And') { %>\n        <%\n          for(var j = 0;j < property.definition.inputs.length;j++) {\n            var item = property.definition.inputs[j]\n        %>\n        if(challengeInput == <%= j %>) {\n          return type.Property({\n            predicateAddress: Not,\n            inputs: [<%= getEncodedProperty(item) %>]\n          });\n        }\n        <% } %>\n      <% } else if(property.definition.predicate == 'ForAllSuchThat') {\n        const quantifier = property.definition.inputs[0];\n        const innerProperty = property.definition.inputs[1];\n        %>\n      require(<%= quantifier.predicate.source %>.decide(<%=getInputs(quantifier)%>, challengeInput));\n      return type.Property({\n        predicateAddress: Not,\n        inputs: [<%= getEncodedProperty(innerProperty) %>]\n      });\n      <% } else if(property.definition.predicate == 'Not') {\n        const innerProperty = property.definition.inputs[0];\n        %>\n      return <%= getEncodedProperty(innerProperty) %>;\n      <% } %>\n    }\n  <% } %>\n  /**\n   * Decides <%= property.definition.name %>(<%= property.definition.inputDefs %>).\n   */\n  function decideTrue<%= property.definition.name %>(bytes[] memory _inputs, bytes memory _witness) public {\n      bytes32 propertyHash = keccak256(abi.encode(types.Property({\n        predicateAddress: address(this),\n        inputs: _inputs\n      })));\n      // check property is true\n    <% if(property.definition.predicate == 'And') { %>\n      // check And\n      <%\n        for(var j = 0;j < property.definition.inputs.length;j++) {\n          var item = property.definition.inputs[j]\n      %>\n      require(AdjudicationContract.isDecided(keccak256(<%= getEncodedProperty(item) %>)));\n      <% } %>\n      AdjudicationContract.setPredicateDecision(propertyHash, true);\n    <% } else if(property.definition.predicate == 'ThereExistsSuchThat') { %>\n      // check ThereExistsSuchThat\n      <%\n        const quantifier = property.definition.inputs[0]\n        const innerProperty = property.definition.inputs[1]\n      %>\n      require(<%= quantifier.predicate.source %>.decide(<%= getInputs(quantifier, \"_witness\", true) %>));\n      require(AdjudicationContract.isDecided(keccak256(<%= getEncodedProperty(innerProperty) %>)));\n      AdjudicationContract.setPredicateDecision(propertyHash, true);\n    <% } else if(property.definition.predicate == 'Or') { %>\n      // check Or\n    var result = false\n      <%\n        for(var j = 0;j < property.definition.inputs.length;j++) {\n          var item = property.definition.inputs[j]\n      %>\n    result = result | AdjudicationContract.isDecided(keccak256(<%= getEncodedProperty(item) %>))\n      <% } %>\n    require(result);\n    AdjudicationContract.setPredicateDecision(propertyHash, true);\n    <% } %>\n  }\n  <% } %>\n\n  function bytesToBytes32(bytes memory source) returns (bytes32 result) {\n    if (source.length == 0) {\n        return 0x0;\n    }\n\n    assembly {\n        result := mload(add(source, 32))\n    }\n  }\n}\n<% } %>\n"
export default text