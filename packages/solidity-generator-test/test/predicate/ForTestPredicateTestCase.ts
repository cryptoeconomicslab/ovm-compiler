import * as ForTest from '../../build/contracts/ForTest.json'
import { ethers } from 'ethers'
import {
  encodeLabel,
  encodeString,
  encodeProperty,
  encodeVariable,
  encodeConstant
} from '../helpers/utils'

const transactionA = '0x000001'
const transactionB = '0x000002'
const signature = '0x000003'

export const createForTestCase = (
  [notAddress, andAddress, forAllSuchThatAddress]: string[],
  wallet: ethers.Wallet
) => {
  return {
    name: 'ForTest',
    contract: ForTest,
    extraArgs: [],
    validChallenges: [
      {
        name:
          'isValidChallenge of ForAllSuchThat quantifier and Or logical connective',
        challengeInput: [signature, '0x'],
        getProperty: (
          forTestPredicate: ethers.Contract,
          compiledPredicate: ethers.Contract
        ) => {
          return {
            predicateAddress: forTestPredicate.address,
            inputs: [encodeLabel('ForTestF'), transactionA, transactionB]
          }
        },
        getChallenge: (
          forTestPredicate: ethers.Contract,
          mockAtomicPredicateAddress: string,
          compiledPredicate: ethers.Contract
        ) => {
          return {
            predicateAddress: andAddress,
            inputs: [
              encodeProperty({
                predicateAddress: notAddress,
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
                predicateAddress: notAddress,
                inputs: [
                  encodeProperty({
                    predicateAddress: mockAtomicPredicateAddress,
                    inputs: [transactionA, transactionB, signature]
                  })
                ]
              })
            ]
          }
        }
      },
      {
        name: 'isValidChallenge of Not logocal connective',
        challengeInput: [signature, '0x'],
        getProperty: (
          forTestPredicate: ethers.Contract,
          compiledPredicate: ethers.Contract
        ) => {
          return {
            predicateAddress: forTestPredicate.address,
            inputs: [
              encodeLabel('ForTestFO1N'),
              transactionA,
              transactionB,
              signature
            ]
          }
        },
        getChallenge: (
          forTestPredicate: ethers.Contract,
          mockAtomicPredicateAddress: string,
          compiledPredicate: ethers.Contract
        ) => {
          return {
            predicateAddress: mockAtomicPredicateAddress,
            inputs: [transactionA, transactionB, signature]
          }
        }
      }
    ],
    invalidChallenges: [],
    decideTrueTestCases: [],
    invalidDecideTestCases: []
  }
}
