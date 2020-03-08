import { generateEVMByteCode } from './'
import { transpile } from '@cryptoeconomicslab/ovm-transpiler'
import { Import, Parser } from '@cryptoeconomicslab/ovm-parser'
import fs from 'fs'
import path from 'path'
import { AbiCoder } from 'ethers/utils'
const abi = new AbiCoder()

/**
 * compile all files in a directory
 * @param sourceDir source directory of property definition
 * @param outputDir output directory of generated JSON
 */
export async function compileAllSourceFiles(
  sourceDir: string,
  outputDir: string
) {
  const files = fs.readdirSync(sourceDir)

  await Promise.all(
    files.map(async f => {
      const ext = path.extname(f)
      if (ext == '.ovm') {
        const contractName = path.basename(f, ext)
        const result = await compile(sourceDir, contractName)
        fs.writeFileSync(path.join(outputDir, `${contractName}.json`), result)
      }
    })
  )
}

const load = (loadPath: string, contractName: string) =>
  fs.readFileSync(path.join(loadPath, contractName + '.ovm')).toString()

export async function compile(
  basePath: string,
  contractName: string
): Promise<string> {
  const source = load(basePath, contractName)
  return await generateEVMByteCode(source, (_import: Import) => {
    return load(path.join(basePath, _import.path), _import.module)
  })
}

export function compileJSON(basePath: string, contractName: string) {
  const source = load(basePath, contractName)
  const parser = new Parser()
  return transpile(
    parser.parse(source),
    (_import: Import) => {
      const source = load(path.join(basePath, _import.path), _import.module)
      return parser.parse(source)
    },
    { zero: abi.encode(['uint256'], [0]) }
  )
}
