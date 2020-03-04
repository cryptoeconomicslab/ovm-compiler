import * as AndTest from '../../build/contracts/AndTest.json'
import { ethers } from 'ethers'
import {
  encodeLabel,
  encodeString,
  encodeProperty,
  encodeVariable,
  encodeInteger
} from '../helpers/utils'

const transactionA = '0x000001'
const transactionB = '0x000002'
const signature = '0x000003'

export const createAndTestCase = (
  [notAddress, andAddress, forAllSuchThatAddress]: string[],
  wallet: ethers.Wallet
) => {
  return {
    name: 'AndTest',
    contract: AndTest,
    extraArgs: [],
    validChallenges: [
      {
        name:
          'isValidChallenge of And logical connective and ThereExistsSuchThat quantifier',
        challengeInput: [encodeInteger(1)],
        getProperty: (
          andTestPredicate: ethers.Contract,
          compiledPredicate: ethers.Contract
        ) => {
          return {
            predicateAddress: andTestPredicate.address,
            inputs: [encodeLabel('AndTestA'), transactionA, transactionB]
          }
        },
        getChallenge: (
          andTestPredicate: ethers.Contract,
          mockAtomicPredicateAddress: string,
          compiledPredicate: ethers.Contract
        ) => {
          return {
            predicateAddress: forAllSuchThatAddress,
            inputs: [
              '0x',
              encodeString('v0'),
              encodeProperty({
                predicateAddress: notAddress,
                inputs: [
                  encodeProperty({
                    predicateAddress: mockAtomicPredicateAddress,
                    inputs: [transactionA, transactionB, encodeVariable('v0')]
                  })
                ]
              })
            ]
          }
        }
      }
    ],
    invalidChallenges: [],
    decideTrueTestCases: [
      {
        name: 'AndTestA',
        createParameters: (compiledPredicate: ethers.Contract) => {
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
        createParameters: (compiledPredicate: ethers.Contract) => {
          return {
            inputs: [encodeLabel('AndTestA'), transactionB],
            witnesses: [signature]
          }
        }
      }
    ]
  }
}
