import * as utils from './utils'
import {
  CompiledInput,
  CompiledPredicate,
  IntermediateCompiledPredicate,
  AtomicProposition,
  Placeholder,
  PredicateCall,
  NormalInput,
  ConstantVariable,
  convertStringToLogicalConnective,
  LogicalConnectiveStrings,
  LogicalConnective
} from './CompiledPredicate'
import { PropertyDef, PropertyNode } from '@cryptoeconomicslab/ovm-parser'

/**
 *
 * @param {*} propertyDefs are definition of claim
 */
export function createCompiledPredicates(
  propertyDefs: PropertyDef[]
): CompiledPredicate[] {
  return propertyDefs.map(calculateInteractiveNodesPerProperty)
}

function calculateInteractiveNodesPerProperty(
  p: PropertyDef
): CompiledPredicate {
  const name = utils.toCapitalCase(p.name)
  let newContracts: IntermediateCompiledPredicate[] = []
  if (p.body == null) {
    throw new Error('p.body must not be null')
  }
  searchInteractiveNode(newContracts, p.body, p.inputDefs, name)
  const constants = getConstants(newContracts)
  let result: CompiledPredicate = {
    type: 'CompiledPredicate',
    name,
    inputDefs: p.inputDefs,
    contracts: newContracts,
    entryPoint: newContracts[newContracts.length - 1].name
  }
  if (constants.length > 0) {
    result.constants = constants
  }
  return result
}

/**
 * searchInteractiveNode
 * @param {*} contracts
 * @param {*} property
 * @param {*} parent
 * @param {*} originalPredicateName
 * @param {*} parentSuffix
 */
function searchInteractiveNode(
  contracts: IntermediateCompiledPredicate[],
  property: PropertyNode,
  parentInputDefs: string[],
  originalPredicateName: string,
  parentSuffix?: string
): AtomicProposition {
  if (utils.isNotAtomicProposition(property.predicate)) {
    let suffix = (parentSuffix || '') + property.predicate[0]
    let newInputDefs = getArguments(property)
    if (parentSuffix === undefined) {
      newInputDefs = parentInputDefs
    }
    newInputDefs = [makeContractName(originalPredicateName, suffix)].concat(
      newInputDefs
    )
    const newContract: IntermediateCompiledPredicate = {
      type: 'IntermediateCompiledPredicate',
      originalPredicateName,
      name: makeContractName(originalPredicateName, suffix),
      connective: convertStringToLogicalConnective(
        property.predicate as LogicalConnectiveStrings
      ),
      inputDefs: newInputDefs,
      inputs: [],
      propertyInputs: []
    }
    let children: (AtomicProposition | Placeholder)[] = []
    if (
      property.predicate == 'ForAllSuchThat' ||
      property.predicate == 'ThereExistsSuchThat'
    ) {
      if (property.inputs[0] == undefined) {
        throw new Error('property.inputs[0] must not be string')
      }
      if (
        typeof property.inputs[2] == 'string' ||
        property.inputs[2] == undefined
      ) {
        throw new Error('property.inputs[2] must not be string')
      }
      if (property.inputs[2].type != 'PropertyNode') {
        throw new Error('property.inputs[2] must not be PropertyNode')
      }
      // quantifier
      if (typeof property.inputs[0] == 'string') {
        children[0] = property.inputs[0]
      } else {
        children[0] = searchInteractiveNode(
          contracts,
          property.inputs[0],
          newContract.inputDefs,
          originalPredicateName
        )
      }
      // placeholder
      children[1] = property.inputs[1] as string
      // innerProperty
      children[2] = searchInteractiveNode(
        contracts,
        property.inputs[2],
        newContract.inputDefs,
        originalPredicateName,
        suffix
      )
    } else if (
      property.predicate == 'And' ||
      property.predicate == 'Or' ||
      property.predicate == 'Not'
    ) {
      property.inputs.forEach(
        (p: PropertyNode | string | undefined, i: number) => {
          if (typeof p == 'string' || p == undefined) {
            throw new Error(`property.inputs[${i}] must not be string`)
          }
          if (p.type != 'PropertyNode') {
            throw new Error(`property.inputs[${i}] must not be PropertyNode`)
          }
          children[i] = searchInteractiveNode(
            contracts,
            p,
            newContract.inputDefs,
            originalPredicateName,
            suffix + (i + 1)
          )
        }
      )
    }
    newContract.inputs = children
    newContract.propertyInputs = getPropertyInputIndexes(children)
    // If not atomic proposition, generate a contract
    contracts.push(newContract)
    return {
      type: 'AtomicProposition',
      predicate: {
        type: 'AtomicPredicateCall',
        source: newContract.name
      },
      inputs: getInputIndex(parentInputDefs, newInputDefs, true),
      isCompiled: true
    }
  } else {
    return {
      type: 'AtomicProposition',
      predicate: getPredicate(parentInputDefs, property.predicate),
      inputs: getInputIndex(parentInputDefs, property.inputs as string[])
    }
  }
}

function getPredicate(inputDefs: string[], name: string): PredicateCall {
  const inputIndex = inputDefs.indexOf(name)
  if (inputIndex >= 0) {
    return {
      type: 'InputPredicateCall',
      source: {
        type: 'NormalInput',
        inputIndex: inputIndex,
        children: []
      }
    }
  } else if (utils.isUpperCase(name[0])) {
    if (utils.isCompiledPredicate(name)) {
      // This is for calling user defined predicate dybamically
      return {
        type: 'CompiledPredicateCall',
        source: name
      }
    } else {
      return {
        type: 'AtomicPredicateCall',
        source: name
      }
    }
  } else {
    return {
      type: 'VariablePredicateCall'
    }
  }
}

function getPropertyInputIndexes(
  children: (AtomicProposition | Placeholder)[]
): NormalInput[] {
  const allInputs = children.reduce((acc: CompiledInput[], c) => {
    if (typeof c != 'string') {
      return acc.concat(c.inputs)
    }
    return acc
  }, [])
  const result: NormalInput[] = []
  allInputs.forEach(input => {
    if (input.type == 'NormalInput') {
      if (input.children.length >= 1) {
        if (!result[input.inputIndex]) {
          result[input.inputIndex] = {
            type: 'NormalInput',
            inputIndex: input.inputIndex,
            children: []
          }
        }
        if (input.children.length == 2) {
          result[input.inputIndex].children.push(input.children[0])
        }
      }
    }
  })
  return result.filter(r => !!r)
}

function getInputIndex(
  inputDefs: string[],
  inputs: string[],
  isFirstInputLabel: boolean = false
): CompiledInput[] {
  return inputs.map((name, index) => {
    if (name.indexOf('.') > 0) {
      // in case of that name is bind operator
      const parentAndChildren = utils.getBindParams(name)
      const inputIndex = inputDefs.indexOf(parentAndChildren.parent)
      if (inputIndex >= 0) {
        return {
          type: 'NormalInput',
          inputIndex: inputDefs.indexOf(parentAndChildren.parent),
          children: parentAndChildren.children
        }
      } else {
        if (utils.isReservedWord(parentAndChildren.parent)) {
          return {
            type: 'SelfInput',
            children: parentAndChildren.children
          }
        } else {
          return {
            type: 'VariableInput',
            placeholder: parentAndChildren.parent,
            children: parentAndChildren.children
          }
        }
      }
    } else {
      const inputIndex = inputDefs.indexOf(name)
      if (inputIndex >= 0) {
        return {
          type: 'NormalInput',
          inputIndex: inputDefs.indexOf(name),
          children: []
        }
      }
    }
    if (utils.isConstantVariable(name)) {
      return {
        type: 'ConstantInput',
        name: name.substr(1)
      }
    } else if (isFirstInputLabel && index == 0) {
      return {
        type: 'LabelInput',
        label: name
      }
    } else {
      return {
        type: 'VariableInput',
        placeholder: name,
        children: []
      }
    }
  })
}

function getArguments(property: PropertyNode): string[] {
  let args: string[] = []
  if (
    property.predicate == 'ForAllSuchThat' ||
    property.predicate == 'ThereExistsSuchThat'
  ) {
    if (typeof property.inputs[0] !== 'string') {
      // If inputs[0] is not hint string
      args = args.concat(getArguments(property.inputs[0] as PropertyNode))
    }
    const variable = property.inputs[1] as string
    const innerArgs = getArguments(property.inputs[2] as PropertyNode)
    args = args.concat(innerArgs.filter(a => a != variable))
  } else {
    if (!utils.isUpperCase(property.predicate[0])) {
      args.push(property.predicate)
    }
    property.inputs.forEach((p: PropertyNode | string | undefined) => {
      if (p === undefined) {
        return
      }
      if (typeof p === 'string') {
        let usedValName = null
        // bind operator
        if (p.indexOf('.') > 0) {
          usedValName = p.substr(0, p.indexOf('.'))
        } else {
          usedValName = p
        }
        if (
          !utils.isReservedWord(usedValName) &&
          !utils.isConstantVariable(usedValName)
        ) {
          args.push(usedValName)
        }
      } else if (p.type == 'PropertyNode') {
        args = args.concat(getArguments(p))
      }
    })
  }
  return args.filter(function(x, i, self) {
    return self.indexOf(x) === i
  })
}

function makeContractName(name: string, suffix: string) {
  return utils.toCapitalCase(name) + suffix
}

function getConstants(
  predicates: IntermediateCompiledPredicate[]
): ConstantVariable[] {
  const results: ConstantVariable[] = []
  predicates.forEach(p => {
    p.inputs.forEach(i => {
      if (typeof i != 'string' && i.type == 'AtomicProposition') {
        if (i.predicate.type == 'CompiledPredicateCall' && !i.isCompiled) {
          const predicateName = i.predicate.source
          if (
            utils.isCompiledPredicate(predicateName) &&
            !results.find(r => r.name == predicateName)
          ) {
            results.push({
              varType: 'address',
              name: predicateName
            })
          }
        }
        i.inputs.forEach(i => {
          if (
            i.type == 'ConstantInput' &&
            !results.find(r => r.name == i.name)
          ) {
            results.push({
              varType: 'bytes',
              name: i.name
            })
          }
        })
      }
    })
  })
  return results
}
