import { ethers } from 'ethers'
import { OvmProperty } from './utils'

export interface TestCase<T> {
  name: string
  getTestCase: (targetPredicate: ethers.Contract, context: TestContext) => T
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
}

export interface TestCaseSet {
  name: string
  contract: any
  extraArgs: string[]
  validChallenges: TestCase<ChallengeTestData>[]
  invalidChallenges: TestCase<ChallengeTestData>[]
  decideTrueTestCases: TestCase<DecideTestData>[]
  invalidDecideTestCases: TestCase<DecideTestData>[]
}
