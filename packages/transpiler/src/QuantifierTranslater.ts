import { BigNumber } from '@cryptoeconomicslab/primitives'
import { PropertyDef, PropertyNode } from '@cryptoeconomicslab/ovm-parser'
import * as utils from './utils'

interface PredicatePreset {
  name: string
  translate: (p: PropertyNode) => PropertyNode
}

interface QuantifierPreset {
  name: string
  translate: (
    quantifier: PropertyNode,
    variable: string
  ) => { hint: string; property: PropertyNode }
}

/**
 * replace inputs of targetNode by calling inputs
 * @param targetNode
 * @param callingInputs
 * @param inputDefs
 */
export const replaceInputs = (
  targetNode: PropertyNode,
  callingInputs: string[],
  inputDefs: string[]
): PropertyNode => {
  if (callingInputs.length < inputDefs.length) {
    throw new Error(
      `The size of inputDefs must be less than or equal the size of callingInputs at ${targetNode.predicate}.`
    )
  }
  return {
    type: 'PropertyNode',
    predicate: targetNode.predicate,
    inputs: targetNode.inputs.map(i => {
      if (typeof i == 'string') {
        const index = inputDefs.indexOf(i)
        if (index >= 0) {
          return callingInputs[index]
        }
      } else if (i && i.type == 'PropertyNode') {
        return replaceInputs(i, callingInputs, inputDefs)
      }
      return i
    })
  }
}

/**
 * create preset predicate from property definition
 * @param propertyDefinition
 */
function createPredicatePreset(
  propertyDefinition: PropertyDef
): PredicatePreset {
  return {
    name: propertyDefinition.name,
    translate: (p: PropertyNode) =>
      replaceInputs(
        propertyDefinition.body,
        p.inputs as string[],
        propertyDefinition.inputDefs
      )
  }
}

export const replaceHint = (
  hint: string,
  substitutions: { [key: string]: string }
): string => {
  const fillTemplate = function(
    templateString: string,
    templateVars: string[]
  ) {
    return new Function(
      ...Object.keys(substitutions).concat(['return `' + templateString + '`'])
    ).call(null, ...templateVars)
  }
  return fillTemplate(
    hint,
    Object.keys(substitutions).map(k => substitutions[k])
  )
}

/**
 * create preset quantifier from property definition
 * @param propertyDefinition
 */
export function createQuantifierPreset(
  propertyDefinition: PropertyDef,
  constants: { [key: string]: string } = {}
): QuantifierPreset | null {
  const getSubstitutions = (
    callingInputs: string[]
  ): { [key: string]: string } => {
    const substitutions: { [key: string]: string } = constants
    // skip variable
    // When we parse predicate as quantifier, the first input is variable.
    propertyDefinition.inputDefs.slice(1).forEach((inputName, index) => {
      substitutions[inputName] = '${' + callingInputs[index] + '}'
    })
    return substitutions
  }
  const quantifierAnnotation = propertyDefinition.annotations.find(
    a => a.body.name == 'quantifier'
  )
  if (!quantifierAnnotation) {
    return null
  }
  const hint = quantifierAnnotation.body.args[0]
  return {
    name: propertyDefinition.name,
    translate: (quantifier: PropertyNode, variable: string) => {
      const callingInputs = quantifier.inputs as string[]
      return {
        hint: replaceHint(hint, getSubstitutions(callingInputs)),
        property: replaceInputs(
          propertyDefinition.body,
          [variable].concat(callingInputs),
          propertyDefinition.inputDefs
        )
      }
    }
  }
}

/**
 * apply preset predicate library and preset quantifier library.
 * @param propertyDefinitions
 * @param importedPredicates
 */
export function applyLibraries(
  propertyDefinitions: PropertyDef[],
  importedPredicates: PropertyDef[],
  constants: { [key: string]: string } = {}
): PropertyDef[] {
  const inlinePredicates = importedPredicates.filter(p => utils.isLibrary(p))
  const predicatePresets = inlinePredicates.map(importedPredicate => {
    return createPredicatePreset(importedPredicate)
  }, {})
  const quantifierPresets = inlinePredicates.map(importedPredicate => {
    return createQuantifierPreset(importedPredicate, constants)
  }, {})
  propertyDefinitions.reduce(
    ({ predicatePresets, quantifierPresets }, propertyDefinition) => {
      const translator = createTranslator(predicatePresets, quantifierPresets)
      propertyDefinition.body = translator(propertyDefinition.body)
      return {
        predicatePresets: predicatePresets.concat([
          createPredicatePreset(propertyDefinition)
        ]),
        quantifierPresets: quantifierPresets.concat([
          createQuantifierPreset(propertyDefinition, constants)
        ])
      }
    },
    { predicatePresets, quantifierPresets }
  )
  return propertyDefinitions
}

function createTranslator(
  predicatePresets: PredicatePreset[],
  quantifierPresets: (QuantifierPreset | null)[]
) {
  const presetTable: {
    [key: string]: PredicatePreset
  } = predicatePresets.reduce<{ [key: string]: PredicatePreset }>((t, p) => {
    t[p.name] = p
    return t
  }, {})
  const quantifierPresetTable: {
    [key: string]: QuantifierPreset
  } = quantifierPresets.reduce<{ [key: string]: QuantifierPreset }>((t, p) => {
    if (p) {
      t[p.name] = p
    }
    return t
  }, {})
  const translate = (
    p: PropertyNode,
    variableSuffix: number = 0
  ): PropertyNode => {
    if (utils.isAtomicProposition(p.predicate)) {
      const preset = presetTable[p.predicate]
      if (preset) {
        return preset.translate(p)
      }
    } else if (p.predicate == 'ForAllSuchThat') {
      return translateForAllSuchThat(p)
    } else if (p.predicate == 'ThereExistsSuchThat') {
      return translateThereExistsSuchThat(p, (variableSuffix++).toString())
    } else {
      p.inputs = p.inputs.map((i: string | undefined | PropertyNode) => {
        if (typeof i === 'string' || i === undefined) {
          return i
        } else {
          return translate(i, variableSuffix)
        }
      })
    }
    return p
  }
  const translateForAllSuchThat = (p: PropertyNode): PropertyNode => {
    if (p.inputs[0] === undefined || typeof p.inputs[0] === 'string') {
      throw new Error('invalid quantifier')
    }
    const preset = quantifierPresetTable[p.inputs[0].predicate]
    p.inputs[2] = translate(p.inputs[2] as PropertyNode)
    if (preset) {
      const quantifier = p.inputs[0] as PropertyNode
      const variable = p.inputs[1] as string
      const translated = preset.translate(quantifier, variable)
      p.inputs[0] = translated.hint
      const condition = translated.property
      if (condition) {
        p.inputs[2] = {
          type: 'PropertyNode',
          predicate: 'Or',
          inputs: [
            {
              type: 'PropertyNode',
              predicate: 'Not',
              inputs: [translate(condition)]
            },
            p.inputs[2]
          ]
        }
      }
    }
    return p
  }
  const translateThereExistsSuchThat = (
    p: PropertyNode,
    suffix: string
  ): PropertyNode => {
    if (p.inputs[0] === undefined || typeof p.inputs[0] === 'string') {
      return p
    }
    const preset = quantifierPresetTable[p.inputs[0].predicate]
    const originalChildren = (p.inputs.slice(2) as PropertyNode[]).map(
      translate
    )
    if (preset) {
      const quantifier = p.inputs[0] as PropertyNode
      if (p.inputs[1] === undefined) {
        p.inputs[1] = 'v' + suffix
      }
      const variable = p.inputs[1] as string
      const translated = preset.translate(quantifier, variable)
      p.inputs[0] = translated.hint
      if (translated.property) {
        if (originalChildren.length == 1) {
          // Q.any(v -> ...)
          if (originalChildren[0].predicate == 'And') {
            p.inputs[2] = {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [translate(translated.property)].concat(
                originalChildren[0].inputs as PropertyNode[]
              )
            }
          } else {
            p.inputs[2] = {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [translate(translated.property)].concat(originalChildren)
            }
          }
        } else {
          // Q.any()
          p.inputs[2] = translate(translated.property)
        }
      }
    }
    return p
  }

  return translate
}
