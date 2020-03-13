import chai from 'chai'
import { ethers } from 'ethers'
import {
  createMockProvider,
  deployContract,
  solidity,
  getWallets
} from 'ethereum-waffle'
import { randomAddress, deployCompiledPredicate } from '.'
import { TestCaseSet, TestContext } from './testCase'

chai.use(solidity)
chai.use(require('chai-as-promised'))
const { expect, assert } = chai

export interface SetUpCompiledPredicateTestOptions {
  gasLimit: number
}

export function setUpCompiledPredicateTest(
  name: string,
  createTestCases: (wallet: ethers.Wallet) => TestCaseSet[],
  MockAtomicPredicate: any,
  MockCompiledPredicate: any,
  Utils: any,
  MockAdjudicationContract: any,
  options: SetUpCompiledPredicateTestOptions = { gasLimit: 6_000_000 }
) {
  describe(name, () => {
    let provider = createMockProvider()
    let wallets = getWallets(provider)
    let wallet = wallets[0]
    const notAddress = randomAddress()
    const andAddress = randomAddress()
    const forAllSuchThatAddress = randomAddress()
    const ownershipPayout = randomAddress()
    let mockAtomicPredicate: ethers.Contract
    let mockCompiledPredicate: ethers.Contract
    let testContext: TestContext

    beforeEach(async () => {
      mockAtomicPredicate = await deployContract(
        wallet,
        MockAtomicPredicate,
        []
      )
      mockCompiledPredicate = await deployContract(
        wallet,
        MockCompiledPredicate,
        []
      )
      testContext = {
        not: notAddress,
        and: andAddress,
        forAllSuchThat: forAllSuchThatAddress,
        mockAtomicPredicate: mockAtomicPredicate.address,
        mockCompiledPredicate: mockCompiledPredicate.address,
        payout: ownershipPayout,
        gasLimit: options.gasLimit,
        deployedContractAddresses: []
      }
    })

    const testcases = createTestCases(wallet)

    testcases.forEach(testcase => {
      describe(testcase.name, () => {
        let targetPredicate: ethers.Contract
        beforeEach(async () => {
          targetPredicate = await deployCompiledPredicate(
            wallet,
            Utils,
            MockAdjudicationContract,
            testcase,
            testContext
          )
        })

        describe('isValidChallenge', () => {
          testcase.validChallenges.forEach(validChallenge => {
            it(validChallenge.name, async () => {
              const challengeTestCase = validChallenge.getTestData(
                targetPredicate,
                testContext
              )
              const result = await targetPredicate.isValidChallenge(
                challengeTestCase.property.inputs,
                challengeTestCase.challengeInputs,
                challengeTestCase.challenge
              )
              assert.isTrue(result)
            })
          })

          testcase.invalidChallenges.forEach(invalidChallenge => {
            it(invalidChallenge.name, async () => {
              const challengeTestCase = invalidChallenge.getTestData(
                targetPredicate,
                testContext
              )
              await expect(
                targetPredicate.isValidChallenge(
                  challengeTestCase.property.inputs,
                  challengeTestCase.challengeInputs,
                  challengeTestCase.challenge
                )
              ).to.be.reverted
            })
          })
        })

        describe('decide', () => {
          testcase.decideTrueTestCases.forEach(decideTrueTestCase => {
            it(decideTrueTestCase.name, async () => {
              const decideTestCase = decideTrueTestCase.getTestData(
                targetPredicate,
                testContext
              )
              const result = await targetPredicate.decide(
                decideTestCase.inputs,
                decideTestCase.witnesses
              )
              assert.isTrue(result)
            })
          })

          testcase.invalidDecideTestCases.forEach(decideTrueTestCase => {
            it(decideTrueTestCase.name, async () => {
              const decideTestCase = decideTrueTestCase.getTestData(
                targetPredicate,
                testContext
              )
              await expect(
                targetPredicate.decide(
                  decideTestCase.inputs,
                  decideTestCase.witnesses
                )
              ).to.be.reverted
            })
          })
        })
      })
    })
  })
}
