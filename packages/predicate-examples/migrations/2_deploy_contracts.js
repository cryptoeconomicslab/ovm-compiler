const Utils = artifacts.require('Utils.sol')
const UniversalAdjudicationContract = artifacts.require('UniversalAdjudicationContract')
const TestPredicate = artifacts.require('TestPredicate')
const CommitmentContract = artifacts.require('CommitmentContract')

module.exports = function(deployer) {
  deployer
    .deploy(Utils)
    .then(() => deployer.link(Utils, UniversalAdjudicationContract))
    .then(() => deployer.deploy(UniversalAdjudicationContract))
    .then(() => deployer.deploy(TestPredicate, UniversalAdjudicationContract.address))
    .then(() => deployer.deploy(CommitmentContract))
}
