import {
  SolidityCodeGeneratorOptions,
  SolidityCodeGenerator
} from '@cryptoeconomicslab/ovm-solidity-generator'
import { CompiledPredicate } from '@cryptoeconomicslab/ovm-transpiler'
import { CodeGenerator } from '@cryptoeconomicslab/ovm-generator'
import { basename } from 'path'
import template from './template'

export class EthereumCodeGenerator implements CodeGenerator {
  constructor(readonly options?: SolidityCodeGeneratorOptions) {}
  async generate(compiledPredicates: CompiledPredicate[]): Promise<string> {
    const solidityGenerator = new SolidityCodeGenerator(this.options)
    const source = await solidityGenerator.generate(compiledPredicates)

    const input = {
      language: 'Solidity',
      sources: {
        'test.sol': {
          content: source
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': [
              'evm.bytecode.object',
              'evm.deployedBytecode.object',
              'abi',
              'evm.bytecode.sourceMap',
              'evm.deployedBytecode.sourceMap'
            ],
            '': ['ast']
          }
        }
      }
    }

    /*
     * When importing solc in jest or for client, an exception thrown.
     * https://github.com/ethereum/solc-js/issues/226
     * using dynamic import to avoid this problem.
     */
    const solc = await import('solc')
    const outputString = solc.compile(JSON.stringify(input), (path: string) => {
      return { contents: template[basename(path, '.sol')] }
    })
    const output = JSON.parse(outputString)
    if (output.errors.length > 0) {
      console.error(output.errors.filter((e: any) => e.severity == 'error'))
    }
    const contract = output.contracts['test.sol']
    const name = Object.keys(contract)[0]
    return JSON.stringify(output.contracts['test.sol'][name])
  }
}
