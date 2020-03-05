import { ethers } from 'ethers'
import { OvmProperty } from './utils'

export interface ChallengeTestCase {
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

export interface DecideTestCase {
  name: string
  createParameters: (
    compiledPredicate: ethers.Contract
  ) => { inputs: string[]; witnesses: string[] }
}

export interface TestCase {
  name: string
  contract: any
  extraArgs: string[]
  validChallenges: ChallengeTestCase[]
  invalidChallenges: ChallengeTestCase[]
  decideTrueTestCases: DecideTestCase[]
  invalidDecideTestCases: DecideTestCase[]
}
