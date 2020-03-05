import * as MockAdjudicationContract from '../build/contracts/MockAdjudicationContract.json'
import * as MockAtomicPredicate from '../build/contracts/MockAtomicPredicate.json'
import * as MockCompiledPredicate from '../build/contracts/MockCompiledPredicate.json'
import * as Utils from '../build/contracts/Utils.json'
import * as ethers from 'ethers'
import { TestCaseSet, setUpTest } from '../src/helper'
import { createAndTestCase } from './AndTestPredicateTestCase'
import { createForTestCase } from './ForTestPredicateTestCase'

const createTestCases: (wallet: ethers.Wallet) => TestCaseSet[] = (
  wallet: ethers.Wallet
) => [createAndTestCase(wallet), createForTestCase(wallet)]

setUpTest(
  'predicates',
  createTestCases,
  MockAtomicPredicate,
  MockCompiledPredicate,
  Utils,
  MockAdjudicationContract
)
