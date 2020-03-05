import { ethers } from 'ethers'
import { OvmProperty } from '../helpers/utils'
import { createAndTestCase } from './AndTestPredicateTestCase'
import { createForTestCase } from './ForTestPredicateTestCase'

interface ChallengeTestCase {
  name: string
  challengeInput?: string[]
  getProperty: (
    ownershipPredicate: ethers.Contract,
    compiledPredicate: ethers.Contract
  ) => OvmProperty
  getChallenge: (
    ownershipPredicate: ethers.Contract,
    mockAtomicPredicateAddress: string,
    compiledPredicate: ethers.Contract
  ) => OvmProperty
}

interface DecideTestCase {
  name: string
  createParameters: (
    compiledPredicate: ethers.Contract
  ) => { inputs: string[]; witnesses: string[] }
}

interface TestCase {
  name: string
  contract: any
  extraArgs: string[]
  validChallenges: ChallengeTestCase[]
  invalidChallenges: ChallengeTestCase[]
  decideTrueTestCases: DecideTestCase[]
  invalidDecideTestCases: DecideTestCase[]
}

export const createTestCases: (
  logicalConnectives: string[],
  wallet: ethers.Wallet
) => TestCase[] = (logicalConnectives: string[], wallet: ethers.Wallet) => [
  createAndTestCase(logicalConnectives, wallet),
  createForTestCase(logicalConnectives, wallet)
]
