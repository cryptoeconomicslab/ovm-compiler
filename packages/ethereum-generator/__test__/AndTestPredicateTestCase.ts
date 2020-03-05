import * as AndTest from '../build/AndTest.json'
import { ethers } from 'ethers'
import {
  encodeLabel,
  encodeString,
  encodeProperty,
  encodeVariable,
  encodeInteger,
  TestCaseSet,
  TestContext
} from '../src/helper'

const transactionA = '0x000001'
const transactionB = '0x000002'
const signature = '0x000003'

export const createAndTestCase = (wallet: ethers.Wallet): TestCaseSet => {
  return {
    name: 'AndTest',
    contract: AndTest,
    getExtraArgs: (context: TestContext) => [],
    validChallenges: [
      {
        name:
          'isValidChallenge of And logical connective and ThereExistsSuchThat quantifier',
        getTestData: (
          andTestPredicate: ethers.Contract,
          context: TestContext
        ) => {
          return {
            challengeInputs: [encodeInteger(1)],
            property: {
              predicateAddress: andTestPredicate.address,
              inputs: [encodeLabel('AndTestA'), transactionA, transactionB]
            },
            challenge: {
              predicateAddress: context.forAllSuchThat,
              inputs: [
                '0x',
                encodeString('v0'),
                encodeProperty({
                  predicateAddress: context.not,
                  inputs: [
                    encodeProperty({
                      predicateAddress: context.mockAtomicPredicate,
                      inputs: [transactionA, transactionB, encodeVariable('v0')]
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
    decideTrueTestCases: [
      {
        name: 'AndTestA',
        getTestData: (
          andTestPredicate: ethers.Contract,
          context: TestContext
        ) => {
          return {
            inputs: [encodeLabel('AndTestA'), transactionA, transactionB],
            witnesses: ['0x', signature]
          }
        }
      }
    ],
    invalidDecideTestCases: [
      {
        name: 'invalid AndTestA',
        getTestData: (
          andTestPredicate: ethers.Contract,
          context: TestContext
        ) => {
          return {
            inputs: [encodeLabel('AndTestA'), transactionB],
            witnesses: [signature]
          }
        }
      }
    ]
  }
}
