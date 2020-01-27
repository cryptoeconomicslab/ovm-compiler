import { Parser } from './Parser'
import { PropertyDef } from './PropertyDef'
import fs from 'fs'
import path from 'path'

function loadTest(testCaseName: string) {
  return fs
    .readFileSync(
      path.join(__dirname, `../../../examples/testcases/${testCaseName}.txt`)
    )
    .toString()
}

describe('Parser', () => {
  let parser: Parser
  beforeEach(async () => {
    parser = new Parser()
  })
  describe('parse', () => {
    describe('operator', () => {
      test('and', () => {
        const testOutput = loadTest('operators/and')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'andTest',
            inputDefs: ['a', 'b'],
            body: {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a'] },
                { type: 'PropertyNode', predicate: 'Bar', inputs: ['b'] }
              ]
            }
          }
        ])
      })
      test('or', () => {
        const testOutput = loadTest('operators/or')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'orTest',
            inputDefs: ['a', 'b'],
            body: {
              type: 'PropertyNode',
              predicate: 'Or',
              inputs: [
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a'] },
                { type: 'PropertyNode', predicate: 'Bar', inputs: ['b'] }
              ]
            }
          }
        ])
      })
      test('not', () => {
        const testOutput = loadTest('operators/not')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'notTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'Not',
              inputs: [
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a'] }
              ]
            }
          }
        ])
      })
      test('forall', () => {
        const testOutput = loadTest('operators/forall')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'forallTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'ForAllSuchThat',
              inputs: [
                { type: 'PropertyNode', predicate: 'A', inputs: ['a'] },
                'b',
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['b'] }
              ]
            }
          }
        ])
      })
      test('there', () => {
        const testOutput = loadTest('operators/there')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'thereTest',
            inputDefs: [],
            body: {
              type: 'PropertyNode',
              predicate: 'ThereExistsSuchThat',
              inputs: [
                { type: 'PropertyNode', predicate: 'A', inputs: [] },
                'a',
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a'] }
              ]
            }
          }
        ])
      })
      test('there without child', () => {
        const testOutput = `def thereTest() := A().any()`
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'thereTest',
            inputDefs: [],
            body: {
              type: 'PropertyNode',
              predicate: 'ThereExistsSuchThat',
              inputs: [{ type: 'PropertyNode', predicate: 'A', inputs: [] }]
            }
          }
        ])
      })
    })
    describe('bind', () => {
      test('bindand', () => {
        const testOutput = loadTest('bind/bindand')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'bindAndTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a.0'] },
                { type: 'PropertyNode', predicate: 'Bar', inputs: ['a.1'] }
              ]
            }
          }
        ])
      })
      test('bindval', () => {
        const testOutput = loadTest('bind/bindval')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'bindValTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'ThereExistsSuchThat',
              inputs: [
                { type: 'PropertyNode', predicate: 'Bytes', inputs: [] },
                'b',
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['b.0', 'a'] }
              ]
            }
          }
        ])
      })
      test('bind2', () => {
        const testOutput = loadTest('bind/bind2')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'bind2Test',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a.0'] },
                { type: 'PropertyNode', predicate: 'Bar', inputs: ['a.1.2'] }
              ]
            }
          }
        ])
      })

      test('bindaddr', () => {
        const testOutput = loadTest('bind/bindaddr')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'bindAddrTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [
                {
                  type: 'PropertyNode',
                  predicate: 'Equal',
                  inputs: ['a.address', 'self.address']
                },
                { type: 'PropertyNode', predicate: 'Bar', inputs: ['a.0'] }
              ]
            }
          }
        ])
      })
    })

    describe('variable', () => {
      test('eval1', () => {
        const testOutput = loadTest('variable/eval1')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'evalTest',
            inputDefs: ['a', 'b'],
            body: {
              type: 'PropertyNode',
              predicate: 'And',
              inputs: [
                { type: 'PropertyNode', predicate: 'Foo', inputs: ['a'] },
                { type: 'PropertyNode', predicate: 'b', inputs: [] }
              ]
            }
          }
        ])
      })
      test('forval', () => {
        const testOutput = loadTest('variable/forval')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'forValTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'ForAllSuchThat',
              inputs: [
                { type: 'PropertyNode', predicate: 'A', inputs: ['a'] },
                'b',
                { type: 'PropertyNode', predicate: 'b', inputs: [] }
              ]
            }
          }
        ])
      })
      test('thereval', () => {
        const testOutput = loadTest('variable/thereval')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'thereValTest',
            inputDefs: [],
            body: {
              type: 'PropertyNode',
              predicate: 'ThereExistsSuchThat',
              inputs: [
                { type: 'PropertyNode', predicate: 'A', inputs: [] },
                'a',
                { type: 'PropertyNode', predicate: 'a', inputs: [] }
              ]
            }
          }
        ])
      })
      test('thereval2', () => {
        const testOutput = loadTest('variable/thereval2')
        const ast: PropertyDef[] = parser.parse(testOutput).declarations
        expect(ast).toStrictEqual([
          {
            annotations: [],
            name: 'thereValTest',
            inputDefs: ['a'],
            body: {
              type: 'PropertyNode',
              predicate: 'ThereExistsSuchThat',
              inputs: [
                { type: 'PropertyNode', predicate: 'B', inputs: [] },
                'b',
                { type: 'PropertyNode', predicate: 'a', inputs: ['b'] }
              ]
            }
          }
        ])
      })
    })

    describe('import', () => {
      test('import', () => {
        const testOutput = `
        from aaa import bbb
        def Foo(a, b) := Bool(a) and Bool(b)
        `
        const ast = parser.parse(testOutput)
        expect(ast).toStrictEqual({
          imports: [
            {
              path: 'aaa',
              module: 'bbb'
            }
          ],
          declarations: [
            {
              annotations: [],
              name: 'Foo',
              inputDefs: ['a', 'b'],
              body: {
                type: 'PropertyNode',
                predicate: 'And',
                inputs: [
                  { type: 'PropertyNode', predicate: 'Bool', inputs: ['a'] },
                  { type: 'PropertyNode', predicate: 'Bool', inputs: ['b'] }
                ]
              }
            }
          ]
        })
      })
    })

    describe('annotation', () => {
      test('annotation', () => {
        const testOutput = `
        @quantifier("bucket\${b},type,\${a}")
        def Foo(a, b) := Bool(a) and Bool(b)
        `
        const ast = parser.parse(testOutput)
        expect(ast).toStrictEqual({
          imports: [],
          declarations: [
            {
              annotations: [
                {
                  type: 'Annotation',
                  body: { name: 'quantifier', args: ['bucket${b},type,${a}'] }
                }
              ],
              name: 'Foo',
              inputDefs: ['a', 'b'],
              body: {
                type: 'PropertyNode',
                predicate: 'And',
                inputs: [
                  { type: 'PropertyNode', predicate: 'Bool', inputs: ['a'] },
                  { type: 'PropertyNode', predicate: 'Bool', inputs: ['b'] }
                ]
              }
            }
          ]
        })
      })
    })
  })
})
