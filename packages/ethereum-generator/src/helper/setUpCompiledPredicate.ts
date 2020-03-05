import { deployContract } from 'ethereum-waffle'
import ethers from 'ethers'
import { TestCaseSet, TestContext } from './testCase'

export async function setUpCompiledPredicate(
  wallet: ethers.Wallet,
  Utils: any,
  AdjudicationContract: any,
  testCase: TestCaseSet,
  testContext: TestContext
) {
  const utils = await deployContract(wallet, Utils, [])
  const adjudicationContract = await deployContract(
    wallet,
    AdjudicationContract,
    [false]
  )
  const targetPredicate = await deployContract(
    wallet,
    testCase.contract,
    [
      adjudicationContract.address,
      utils.address,
      testContext.not,
      testContext.and,
      testContext.forAllSuchThat
    ].concat(testCase.extraArgs),
    { gasLimit: 5000000 }
  )
  await targetPredicate.setPredicateAddresses(
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.mockAtomicPredicate,
    testContext.payout
  )
  return targetPredicate
}
