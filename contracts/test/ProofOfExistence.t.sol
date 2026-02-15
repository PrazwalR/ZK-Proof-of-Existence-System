// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import "../src/ProofOfExistence.sol";
import "../src/BasicTimestampVerifier.sol";
import "../src/DisclosureVerifier.sol";

contract ProofOfExistenceTest is Test {
    ProofOfExistence public poe;
    BasicTimestampHonkVerifier public timestampVerifier;
    DisclosureHonkVerifier public disclosureVerifier;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    bytes32 constant COMMITMENT = 0x2de81b14360c7f454fbb293eb1fd7529e7437a3e9b9a2e4810bebb3fe2ff283c;
    bytes32 constant TIMESTAMP_FIELD = 0x0000000000000000000000000000000000000000000000000000000067afd900;

    function setUp() public {
        timestampVerifier = new BasicTimestampHonkVerifier();
        disclosureVerifier = new DisclosureHonkVerifier();
        poe = new ProofOfExistence(address(timestampVerifier), address(disclosureVerifier));
    }

    function _loadProof() internal view returns (bytes memory) {
        return vm.readFileBinary("../circuits/basic_timestamp/target/proof");
    }

    function test_DeploymentState() public view {
        assertEq(address(poe.timestampVerifier()), address(timestampVerifier));
        assertEq(address(poe.disclosureVerifier()), address(disclosureVerifier));
    }

    function test_VerifierDirectly() public {
        bytes memory proof = _loadProof();
        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = COMMITMENT;
        publicInputs[1] = TIMESTAMP_FIELD;
        bool result = timestampVerifier.verify(proof, publicInputs);
        assertTrue(result);
    }

    function test_VerifierRejectsWrongInputs() public {
        bytes memory proof = _loadProof();
        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = bytes32(uint256(0xdead));
        publicInputs[1] = TIMESTAMP_FIELD;
        vm.expectRevert();
        timestampVerifier.verify(proof, publicInputs);
    }

    function test_SubmitProof() public {
        bytes memory proof = _loadProof();

        vm.warp(1700000000);
        vm.prank(alice);
        poe.submitProof(proof, COMMITMENT, TIMESTAMP_FIELD);

        (bool exists, address submitter, uint256 timestamp, uint256 blockNumber) = poe.verifyExistence(COMMITMENT);
        assertTrue(exists);
        assertEq(submitter, alice);
        assertEq(timestamp, 1700000000);
        assertEq(blockNumber, block.number);
    }

    function test_RevertOnDuplicateCommitment() public {
        bytes memory proof = _loadProof();

        vm.prank(alice);
        poe.submitProof(proof, COMMITMENT, TIMESTAMP_FIELD);

        vm.prank(bob);
        vm.expectRevert(ProofOfExistence.CommitmentAlreadyExists.selector);
        poe.submitProof(proof, COMMITMENT, TIMESTAMP_FIELD);
    }

    function test_RevertOnInvalidProof() public {
        bytes memory fakeProof = new bytes(14592);

        vm.prank(alice);
        vm.expectRevert();
        poe.submitProof(fakeProof, COMMITMENT, TIMESTAMP_FIELD);
    }

    function test_GetUserCommitments() public {
        bytes memory proof = _loadProof();

        vm.prank(alice);
        poe.submitProof(proof, COMMITMENT, TIMESTAMP_FIELD);

        bytes32[] memory aliceCommitments = poe.getUserCommitments(alice);
        assertEq(aliceCommitments.length, 1);
        assertEq(aliceCommitments[0], COMMITMENT);

        bytes32[] memory bobCommitments = poe.getUserCommitments(bob);
        assertEq(bobCommitments.length, 0);
    }

    function test_VerifyNonExistent() public view {
        (bool exists, address submitter, uint256 timestamp, uint256 blockNumber) = poe.verifyExistence(bytes32(uint256(0xdead)));
        assertFalse(exists);
        assertEq(submitter, address(0));
        assertEq(timestamp, 0);
        assertEq(blockNumber, 0);
    }

    function test_BatchSubmitProofs() public {
        bytes memory proof = _loadProof();

        bytes[] memory proofs = new bytes[](1);
        proofs[0] = proof;

        bytes32[] memory commitmentArr = new bytes32[](1);
        commitmentArr[0] = COMMITMENT;

        bytes32[] memory timestamps = new bytes32[](1);
        timestamps[0] = TIMESTAMP_FIELD;

        vm.prank(alice);
        poe.batchSubmitProofs(proofs, commitmentArr, timestamps);

        (bool exists,,,) = poe.verifyExistence(COMMITMENT);
        assertTrue(exists);
    }

    function test_BatchRevertOnEmptyArray() public {
        bytes[] memory proofs = new bytes[](0);
        bytes32[] memory commitmentArr = new bytes32[](0);
        bytes32[] memory timestamps = new bytes32[](0);

        vm.prank(alice);
        vm.expectRevert(ProofOfExistence.EmptyBatch.selector);
        poe.batchSubmitProofs(proofs, commitmentArr, timestamps);
    }

    function test_BatchRevertOnDuplicate() public {
        bytes memory proof = _loadProof();

        vm.prank(alice);
        poe.submitProof(proof, COMMITMENT, TIMESTAMP_FIELD);

        bytes[] memory proofs = new bytes[](1);
        proofs[0] = proof;
        bytes32[] memory commitmentArr = new bytes32[](1);
        commitmentArr[0] = COMMITMENT;
        bytes32[] memory timestamps = new bytes32[](1);
        timestamps[0] = TIMESTAMP_FIELD;

        vm.prank(bob);
        vm.expectRevert(ProofOfExistence.CommitmentAlreadyExists.selector);
        poe.batchSubmitProofs(proofs, commitmentArr, timestamps);
    }

    function test_DisclosureRevertOnNonExistentCommitment() public {
        bytes memory fakeProof = new bytes(14592);
        bytes32[20] memory fileType;

        vm.prank(alice);
        vm.expectRevert(ProofOfExistence.CommitmentDoesNotExist.selector);
        poe.submitDisclosure(
            fakeProof,
            COMMITMENT,
            false,
            false,
            false,
            bytes32(0),
            bytes32(0),
            bytes32(0),
            fileType
        );
    }

    function test_DisclosureCount() public {
        bytes memory proof = _loadProof();

        vm.prank(alice);
        poe.submitProof(proof, COMMITMENT, TIMESTAMP_FIELD);

        uint256 count = poe.getDisclosureCount(COMMITMENT);
        assertEq(count, 0);
    }

    function testFuzz_RevertOnRandomProof(bytes32 randomCommitment) public {
        vm.assume(randomCommitment != bytes32(0));
        bytes memory fakeProof = new bytes(14592);

        vm.prank(alice);
        vm.expectRevert();
        poe.submitProof(fakeProof, randomCommitment, TIMESTAMP_FIELD);
    }
}
