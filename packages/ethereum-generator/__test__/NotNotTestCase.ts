import * as NotNotTest from '../build/NotNotTest.json'
import { ethers } from 'ethers'
import { encodeLabel, encodeProperty, TestContext } from '../src/helper'

const transactionA = '0x000001'
const transactionB = '0x000002'
const signature = '0x000003'

export const createTestCaseOfNotNotP = (wallet: ethers.Wallet) => {
  return {
    name: '!(SignedBy(a, b).any()) or IsValidSignature(a, b, c)',
    deploy: [
      {
        contract: NotNotTest,
        getExtraArgs: (context: TestContext) => []
      }
    ],
    validChallenges: [
      {
        name:
          'valid challenge of NotNotTestO(a, b, c) should be NotNotTestO1N1T(b, c) and !IsValidSignature(a, b, c)',
        getTestData: (
          notNotTestPredicate: ethers.Contract,
          context: TestContext
        ) => {
          return {
            challengeInputs: ['0x'],
            // NotNotTestO(a, b, c)
            property: {
              predicateAddress: notNotTestPredicate.address,
              inputs: [
                encodeLabel('NotNotTestO'),
                transactionA,
                transactionB,
                signature
              ]
            },
            // NotNotTestO1N1T(b, c) and !IsValidSignature(a, b, c)
            challenge: {
              predicateAddress: context.and,
              inputs: [
                encodeProperty({
                  predicateAddress: notNotTestPredicate.address,
                  inputs: [
                    encodeLabel('NotNotTestO1N1T'),
                    transactionB,
                    signature
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
      }
    ],
    invalidChallenges: [],
    decideTrueTestCases: [],
    invalidDecideTestCases: []
  }
}
