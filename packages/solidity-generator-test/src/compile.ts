import path from 'path'
import { compileAllSourceFiles } from './compileProperty'

compileAllSourceFiles(path.join(__dirname, '../contracts/predicate')).then(
  () => {
    console.log('all compiled')
  }
)
