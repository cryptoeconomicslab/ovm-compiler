import ejs from 'ejs'
import templateSource from './sol'
import decide from './decide'
import getChild from './getChild'
import constructProperty from './constructProperty'
import constructInputs from './constructInputs'
import constructInput from './constructInput'
import decideProperty from './decideProperty'
import { CodeGenerator } from '@cryptoeconomicslab/ovm-generator'
import {
  CompiledPredicate,
  IntermediateCompiledPredicate,
  LogicalConnective,
  AtomicProposition,
  AtomicPredicateCall,
  PredicateCall
} from '@cryptoeconomicslab/ovm-transpiler'

const templates: { [key: string]: string } = {
  decide: decide.toString(),
  getChild: getChild.toString(),
  constructProperty: constructProperty.toString(),
  constructInputs: constructInputs.toString(),
  constructInput: constructInput.toString(),
  decideProperty: decideProperty.toString()
}

export interface SolidityCodeGeneratorOptions {
  addressTable: { [key: string]: string }
  ovmPath?: string
}

const defaultOVMPath = 'ovm-contracts'

export class SolidityCodeGenerator implements CodeGenerator {
  constructor(
    readonly options: SolidityCodeGeneratorOptions = {
      addressTable: {},
      ovmPath: defaultOVMPath
    }
  ) {}
  async generate(compiledPredicates: CompiledPredicate[]): Promise<string> {
    const template = ejs.compile(templateSource.toString(), { client: true })
    const output = template(
      {
        compiledPredicates,
        ...this.getHelpers()
      },
      undefined,
      this.includeCallback
    )
    return output
  }

  includeCallback = (filename: string, d: any) => {
    const template = ejs.compile(templates[filename], {
      client: true
    })
    return template(
      { ...this.getHelpers(), ...d },
      undefined,
      this.includeCallback
    )
  }

  getOVMPath = () => {
    return this.options.ovmPath || defaultOVMPath
  }
  getAddress = (predicateName: string) => {
    return (
      this.options.addressTable[predicateName] ||
      '0x0000000000000000000000000000000000000000'
    )
  }
  indent = (text: string, depth: number) => {
    return text
      .split('\n')
      .map(function(line, num) {
        if (!!line) {
          for (var i = 0; i < depth; i++) {
            line = ' ' + line
          }
        }
        return line
      })
      .join('\n')
  }
  /**
   * isAtomicPropositionNot method check providing atomicProposition is the CompiledPredicate which has Not logical connective.
   * @returns return true if atomicProposition is CompiledPredicate which has not connective, otherwise return false.
   */
  isAtomicPropositionNot = (
    atomicProposition: AtomicProposition,
    predicates: IntermediateCompiledPredicate[]
  ): boolean => {
    const predicateName = (atomicProposition.predicate as AtomicPredicateCall)
      .source
    const innerPredicate = this.getProperty(predicateName, predicates)
    return (
      !!innerPredicate && innerPredicate.connective === LogicalConnective.Not
    )
  }
  getProperty = (
    predicateName: string,
    predicates: IntermediateCompiledPredicate[]
  ) => {
    return predicates.find(p => p.name == predicateName)
  }
  getHelpers = () => {
    return {
      getAddress: this.getAddress,
      indent: this.indent,
      getOVMPath: this.getOVMPath,
      isAtomicPropositionNot: this.isAtomicPropositionNot
    }
  }
}
