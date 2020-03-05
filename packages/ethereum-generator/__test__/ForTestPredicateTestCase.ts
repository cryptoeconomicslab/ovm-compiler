import * as ForTest from '../build/ForTest.json'
import { ethers } from 'ethers'
import { encodeLabel, encodeProperty, TestContext } from '../src/helper'

const transactionA = '0x000001'
const transactionB = '0x000002'
const signature = '0x000003'

export const createForTestCase = (wallet: ethers.Wallet) => {
  return {
    name: 'ForTest',
    contract: ForTest,
    extraArgs: [],
    validChallenges: [
      {
        name:
          'isValidChallenge of ForAllSuchThat quantifier and Or logical connective',
        getTestData: (
          forTestPredicate: ethers.Contract,
          context: TestContext
        ) => {
          return {
            challengeInputs: [signature, '0x'],
            property: {
              predicateAddress: forTestPredicate.address,
              inputs: [encodeLabel('ForTestF'), transactionA, transactionB]
            },
            challenge: {
              predicateAddress: context.and,
              inputs: [
                encodeProperty({
                  predicateAddress: context.not,
                  inputs: [
                    encodeProperty({
                      predicateAddress: forTestPredicate.address,
                      inputs: [
                        encodeLabel('ForTestFO1N'),
                        transactionA,
                        transactionB,
                        signature
                      ]
                    })
                  ]
                }),
                encodeProperty({
                  predicateAddress: context.not,
                  inputs: [
                    encodeProperty({
                      predicateAddress: context.mockAtomicPredicate,
                      inputs: [transactionA, transactionB, signature]
                    })
                  ]
                })
              ]
            }
          }
        }
      },
      {
        name: 'isValidChallenge of Not logocal connective',
        getTestData: (
          forTestPredicate: ethers.Contract,
          context: TestContext
        ) => {
          return {
            challengeInputs: [signature, '0x'],
            property: {
              predicateAddress: forTestPredicate.address,
              inputs: [
                encodeLabel('ForTestFO1N'),
                transactionA,
                transactionB,
                signature
              ]
            },
            challenge: {
              predicateAddress: context.mockAtomicPredicate,
              inputs: [transactionA, transactionB, signature]
            }
          }
        }
      }
    ],
    invalidChallenges: [],
    decideTrueTestCases: [],
    invalidDecideTestCases: []
  }
}
