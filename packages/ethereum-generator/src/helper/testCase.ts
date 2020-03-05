import { ethers } from 'ethers'
import { OvmProperty } from './utils'

export interface TestCase<T> {
  name: string
  getTestData: (targetPredicate: ethers.Contract, context: TestContext) => T
}

export interface ChallengeTestData {
  challengeInputs: string[]
  property: OvmProperty
  challenge: OvmProperty
}

export interface DecideTestData {
  inputs: string[]
  witnesses: string[]
}

export interface TestContext {
  forAllSuchThat: string
  and: string
  not: string
  mockAtomicPredicate: string
  mockCompiledPredicate: string
  payout: string
  gasLimit: number
}

export interface TestCaseSet {
  name: string
  contract: any
  getExtraArgs: (context: TestContext) => string[]
  validChallenges: TestCase<ChallengeTestData>[]
  invalidChallenges: TestCase<ChallengeTestData>[]
  decideTrueTestCases: TestCase<DecideTestData>[]
  invalidDecideTestCases: TestCase<DecideTestData>[]
}
