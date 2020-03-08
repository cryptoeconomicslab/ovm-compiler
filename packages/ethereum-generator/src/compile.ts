// This is compile script to compile all files in "contracts/predicate"
import path from 'path'
import { compileAllSourceFiles } from './compileProperty'

compileAllSourceFiles(
  path.join(__dirname, '../contracts/predicate'),
  path.join(__dirname, '../build')
).then(() => {
  console.log('all compiled')
})
