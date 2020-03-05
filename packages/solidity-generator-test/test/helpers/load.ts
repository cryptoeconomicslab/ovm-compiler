import fs from 'fs'

export function load(path: string) {
  return JSON.parse(fs.readFileSync(path).toString())
}
