import {
  applyLibraries,
  createQuantifierPreset,
  replaceHint,
  replaceInputs
} from '../src/QuantifierTranslater'
import {
  PropertyDef,
  PropertyNode,
  Parser
} from '@cryptoeconomicslab/ovm-parser'
import Coder from '@cryptoeconomicslab/coder'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('QuantifierTranslater', () => {
  beforeEach(async () => {})
  describe('applyLibraries', () => {
    test('SignedBy', () => {
      const input: PropertyDef[] = [
        {
          annotations: [],
          name: 'SignedByTest',
          inputDefs: ['a', 'b'],
          body: {
            type: 'PropertyNode',
            predicate: 'ThereExistsSuchThat',
            inputs: [
              {
                type: 'PropertyNode',
                predicate: 'SignedBy',
                inputs: ['a', 'b']
              }
            ]
          }
        }
      ]
      const library: PropertyDef[] = [
        {
          annotations: [
            {
              type: 'Annotation',
              body: {
                name: 'library',
                args: []
              }
            },
            {
              type: 'Annotation',
              body: {
                name: 'quantifier',
                args: ['signatures,KEY,${message}']
              }
            }
          ],
          name: 'SignedBy',
          inputDefs: ['sig', 'message', 'public_key'],
          body: {
            type: 'PropertyNode',
            predicate: 'IsValidSignature',
            inputs: ['message', 'sig', 'public_key', '$secp256k1']
          }
        }
      ]
      const output = applyLibraries(input, library)
      expect(output).toStrictEqual([
        {
          annotations: [],
          name: 'SignedByTest',
          inputDefs: ['a', 'b'],
          body: {
            type: 'PropertyNode',
            predicate: 'ThereExistsSuchThat',
            inputs: [
              'signatures,KEY,${a}',
              'v0',
              {
                type: 'PropertyNode',
                predicate: 'IsValidSignature',
                inputs: ['a', 'v0', 'b', '$secp256k1']
              }
            ]
          }
        }
      ])
    })

    test('IsLessThan', () => {
      const input: PropertyDef[] = [
        {
          annotations: [],
          name: 'LessThanTest',
          inputDefs: ['b'],
          body: {
            type: 'PropertyNode',
            predicate: 'ForAllSuchThat',
            inputs: [
              {
                type: 'PropertyNode',
                predicate: 'IsLessThan',
                inputs: ['b']
              },
              'bb',
              {
                type: 'PropertyNode',
                predicate: 'Foo',
                inputs: ['bb']
              }
            ]
          }
        }
      ]
      const library: PropertyDef[] = [
        {
          annotations: [
            {
              type: 'Annotation',
              body: {
                name: 'library',
                args: []
              }
            },
            {
              type: 'Annotation',
              body: {
                name: 'quantifier',
                args: ['range,NUMBER,${zero}-${upper_bound}']
              }
            }
          ],
          name: 'IsLessThan',
          inputDefs: ['n', 'upper_bound'],
          body: {
            type: 'PropertyNode',
            predicate: 'IsLessThan',
            inputs: ['n', 'upper_bound']
          }
        }
      ]

      const output = applyLibraries(input, library, { zero: '0' })
      expect(output).toStrictEqual([
        {
          annotations: [],
          name: 'LessThanTest',
          inputDefs: ['b'],
          body: {
            type: 'PropertyNode',
            predicate: 'ForAllSuchThat',
            inputs: [
              'range,NUMBER,0-${b}',
              'bb',
              {
                type: 'PropertyNode',
                predicate: 'Or',
                inputs: [
                  {
                    type: 'PropertyNode',
                    predicate: 'Not',
                    inputs: [
                      {
                        type: 'PropertyNode',
                        predicate: 'IsLessThan',
                        inputs: ['bb', 'b']
                      }
                    ]
                  },
                  { type: 'PropertyNode', predicate: 'Foo', inputs: ['bb'] }
                ]
              }
            ]
          }
        }
      ])
    })

    test('SU', () => {
      const input: PropertyDef[] = [
        {
          annotations: [],
          name: 'SUTest',
          inputDefs: ['token', 'range', 'block'],
          body: {
            type: 'PropertyNode',
            predicate: 'ForAllSuchThat',
            inputs: [
              {
                type: 'PropertyNode',
                predicate: 'SU',
                inputs: ['token', 'range', 'block']
              },
              'su',
              {
                type: 'PropertyNode',
                predicate: 'Foo',
                inputs: ['su']
              }
            ]
          }
        }
      ]
      const parser = new Parser()
      const library: PropertyDef[] = applyLibraries(
        parser.parse(`
@library
@quantifier("proof.block\${b}.range\${t},RANGE,\${r}")
def IncludedAt(p, l, t, r, b) := 
  VerifyInclusion(l, t, r, b, p)

@library
def IncludedWithin(su, b, t, r) := 
  IncludedAt(su, su.0, su.1, b).any()
  and Equal(su.0, t)
  and IsContained(su.1, range)
        
@library
@quantifier("su.block\${token}.range\${range},RANGE,\${block}")
def SU(su, token, range, block) := IncludedWithin(su, block, token, range)
      `).declarations,
        []
      )
      const output = applyLibraries(input, library)
      expect(output).toStrictEqual([
        {
          annotations: [],
          name: 'SUTest',
          inputDefs: ['token', 'range', 'block'],
          body: {
            type: 'PropertyNode',
            predicate: 'ForAllSuchThat',
            inputs: [
              'su.block${token}.range${range},RANGE,${block}',
              'su',
              {
                type: 'PropertyNode',
                predicate: 'Or',
                inputs: [
                  {
                    type: 'PropertyNode',
                    predicate: 'Not',
                    inputs: [
                      {
                        type: 'PropertyNode',
                        predicate: 'And',
                        inputs: [
                          {
                            type: 'PropertyNode',
                            predicate: 'ThereExistsSuchThat',
                            inputs: [
                              'proof.block${b}.range${su.0},RANGE,${su.1}',
                              'v0',
                              {
                                type: 'PropertyNode',
                                predicate: 'VerifyInclusion',
                                inputs: ['su', 'su.0', 'su.1', 'block', 'v0']
                              }
                            ]
                          },
                          {
                            type: 'PropertyNode',
                            predicate: 'Equal',
                            inputs: ['su.0', 'token']
                          },
                          {
                            type: 'PropertyNode',
                            predicate: 'IsContained',
                            inputs: ['su.1', 'range']
                          }
                        ]
                      }
                    ]
                  },
                  { type: 'PropertyNode', predicate: 'Foo', inputs: ['su'] }
                ]
              }
            ]
          }
        }
      ])
    })

    test('Tx', () => {
      const input: PropertyDef[] = [
        {
          annotations: [],
          name: 'TxTest',
          inputDefs: ['token', 'range', 'block'],
          body: {
            type: 'PropertyNode',
            predicate: 'ThereExistsSuchThat',
            inputs: [
              {
                type: 'PropertyNode',
                predicate: 'Tx',
                inputs: ['token', 'range', 'block']
              },
              'tx',
              {
                type: 'PropertyNode',
                predicate: 'Foo',
                inputs: ['tx']
              }
            ]
          }
        }
      ]
      const parser = new Parser()
      const library: PropertyDef[] = parser.parse(`
@library
def IsTx(tx, t, r, b) := 
  Equal(tx.address, $TransactionAddress)
  and Equal(tx.0, t)
  and IsContained(tx.1, range)
  and IsLessThan(tx.2, b)
        
@library
@quantifier("tx.block\${block}.range\${token},RANGE,\${range}")
def Tx(tx, token, range, block) := IsTx(tx, token, range, block)
      `).declarations
      const output = applyLibraries(input, library)
      expect(output).toStrictEqual([
        {
          annotations: [],
          name: 'TxTest',
          inputDefs: ['token', 'range', 'block'],
          body: {
            type: 'PropertyNode',
            predicate: 'ThereExistsSuchThat',
            inputs: [
              'tx.block${block}.range${token},RANGE,${range}',
              'tx',
              {
                type: 'PropertyNode',
                predicate: 'And',
                inputs: [
                  {
                    type: 'PropertyNode',
                    predicate: 'And',
                    inputs: [
                      {
                        type: 'PropertyNode',
                        predicate: 'Equal',
                        inputs: ['tx.address', '$TransactionAddress']
                      },
                      {
                        type: 'PropertyNode',
                        predicate: 'Equal',
                        inputs: ['tx.0', 'token']
                      },
                      {
                        type: 'PropertyNode',
                        predicate: 'IsContained',
                        inputs: ['tx.1', 'range']
                      },
                      {
                        type: 'PropertyNode',
                        predicate: 'IsLessThan',
                        inputs: ['tx.2', 'block']
                      }
                    ]
                  },
                  { type: 'PropertyNode', predicate: 'Foo', inputs: ['tx'] }
                ]
              }
            ]
          }
        }
      ])
    })
  })

  describe('replaceInputs', () => {
    const node: PropertyNode = {
      type: 'PropertyNode',
      predicate: 'ThereExistsSuchThat',
      inputs: [
        {
          type: 'PropertyNode',
          predicate: 'SignedBy',
          inputs: ['a', 'b']
        }
      ]
    }
    test('replace inputs', () => {
      expect(replaceInputs(node, ['aa', 'bb'], ['a', 'b'])).toStrictEqual({
        type: 'PropertyNode',
        predicate: 'ThereExistsSuchThat',
        inputs: [
          {
            type: 'PropertyNode',
            predicate: 'SignedBy',
            inputs: ['aa', 'bb']
          }
        ]
      })
    })

    test('throw error', () => {
      expect(() => replaceInputs(node, ['aa'], ['a', 'b'])).toThrowError(
        'The size of inputDefs must be less than or equal the size of callingInputs at ThereExistsSuchThat.'
      )
    })
  })

  describe('replaceHint', () => {
    test('replace hint', () => {
      expect(replaceHint('a,b,${param}', { param: 'c' })).toStrictEqual('a,b,c')
    })
  })

  describe('createQuantifierPreset', () => {
    const library: PropertyDef = {
      annotations: [
        {
          type: 'Annotation',
          body: {
            name: 'library',
            args: []
          }
        },
        {
          type: 'Annotation',
          body: {
            name: 'quantifier',
            args: ['bucket.${a},KEY,${b}']
          }
        }
      ],
      name: 'FooLib',
      inputDefs: ['v', 'a', 'b'],
      body: {
        type: 'PropertyNode',
        predicate: 'Foo',
        inputs: ['a', 'v', 'b']
      }
    }

    test('create quantifier preset', () => {
      const node: PropertyNode = {
        type: 'PropertyNode',
        predicate: 'FooLib',
        inputs: ['aa', 'bb']
      }
      const preset = createQuantifierPreset(library)
      expect(preset).not.toBeNull()
      if (preset !== null) {
        expect(preset.name).toStrictEqual('FooLib')
        expect(preset.translate(node, 'var_name')).toStrictEqual({
          hint: 'bucket.${aa},KEY,${bb}',
          property: {
            inputs: ['aa', 'var_name', 'bb'],
            predicate: 'Foo',
            type: 'PropertyNode'
          }
        })
      }
    })

    test('not quantifier', () => {
      const library: PropertyDef = {
        annotations: [
          {
            type: 'Annotation',
            body: {
              name: 'library',
              args: []
            }
          }
        ],
        name: 'FooLib',
        inputDefs: ['v', 'a', 'b'],
        body: {
          type: 'PropertyNode',
          predicate: 'Foo',
          inputs: ['a', 'v', 'b']
        }
      }
      const preset = createQuantifierPreset(library)
      expect(preset).toBeNull()
    })
  })
})
