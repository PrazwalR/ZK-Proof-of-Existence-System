// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

interface ITimestampVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

interface IDisclosureVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

contract ProofOfExistence {
    ITimestampVerifier public immutable timestampVerifier;
    IDisclosureVerifier public immutable disclosureVerifier;

    struct CommitmentData {
        address submitter;
        uint256 timestamp;
        uint256 blockNumber;
        bool exists;
    }

    struct DisclosureData {
        bytes32 commitment;
        bool revealEmailDomain;
        bool revealSizeRange;
        bool revealFileType;
        bytes32 claimedDomainHash;
        uint64 claimedSizeMin;
        uint64 claimedSizeMax;
        bytes32[20] claimedFileType;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => CommitmentData) public commitments;
    mapping(address => bytes32[]) public userCommitments;
    mapping(bytes32 => DisclosureData[]) public disclosures;

    event CommitmentSubmitted(address indexed submitter, bytes32 indexed commitment, uint256 timestamp);
    event BatchCommitmentsSubmitted(address indexed submitter, uint256 count);
    event DisclosureSubmitted(address indexed submitter, bytes32 indexed commitment, uint256 disclosureIndex);

    error CommitmentAlreadyExists();
    error InvalidProof();
    error CommitmentDoesNotExist();
    error EmptyBatch();

    constructor(address _timestampVerifier, address _disclosureVerifier) {
        timestampVerifier = ITimestampVerifier(_timestampVerifier);
        disclosureVerifier = IDisclosureVerifier(_disclosureVerifier);
    }

    function submitProof(bytes calldata proof, bytes32 commitment, bytes32 timestampField) external {
        if (commitments[commitment].exists) revert CommitmentAlreadyExists();

        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = commitment;
        publicInputs[1] = timestampField;

        if (!timestampVerifier.verify(proof, publicInputs)) revert InvalidProof();

        commitments[commitment] = CommitmentData({
            submitter: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true
        });
        userCommitments[msg.sender].push(commitment);

        emit CommitmentSubmitted(msg.sender, commitment, block.timestamp);
    }

    function batchSubmitProofs(
        bytes[] calldata proofs,
        bytes32[] calldata _commitments,
        bytes32[] calldata timestampFields
    ) external {
        uint256 len = proofs.length;
        if (len == 0) revert EmptyBatch();
        require(len == _commitments.length && len == timestampFields.length, "Length mismatch");

        for (uint256 i = 0; i < len; i++) {
            if (commitments[_commitments[i]].exists) revert CommitmentAlreadyExists();

            bytes32[] memory publicInputs = new bytes32[](2);
            publicInputs[0] = _commitments[i];
            publicInputs[1] = timestampFields[i];

            if (!timestampVerifier.verify(proofs[i], publicInputs)) revert InvalidProof();

            commitments[_commitments[i]] = CommitmentData({
                submitter: msg.sender,
                timestamp: block.timestamp,
                blockNumber: block.number,
                exists: true
            });
            userCommitments[msg.sender].push(_commitments[i]);
        }

        emit BatchCommitmentsSubmitted(msg.sender, len);
    }

    function submitDisclosure(
        bytes calldata proof,
        bytes32 commitment,
        bool revealEmailDomain,
        bool revealSizeRange,
        bool revealFileType,
        bytes32 claimedDomainHash,
        bytes32 claimedSizeMin,
        bytes32 claimedSizeMax,
        bytes32[20] calldata claimedFileType
    ) external {
        if (!commitments[commitment].exists) revert CommitmentDoesNotExist();

        bytes32[] memory publicInputs = new bytes32[](27);
        publicInputs[0] = commitment;
        publicInputs[1] = revealEmailDomain ? bytes32(uint256(1)) : bytes32(0);
        publicInputs[2] = revealSizeRange ? bytes32(uint256(1)) : bytes32(0);
        publicInputs[3] = revealFileType ? bytes32(uint256(1)) : bytes32(0);
        publicInputs[4] = claimedDomainHash;
        publicInputs[5] = claimedSizeMin;
        publicInputs[6] = claimedSizeMax;
        for (uint256 i = 0; i < 20; i++) {
            publicInputs[7 + i] = claimedFileType[i];
        }

        if (!disclosureVerifier.verify(proof, publicInputs)) revert InvalidProof();

        DisclosureData memory d = DisclosureData({
            commitment: commitment,
            revealEmailDomain: revealEmailDomain,
            revealSizeRange: revealSizeRange,
            revealFileType: revealFileType,
            claimedDomainHash: claimedDomainHash,
            claimedSizeMin: uint64(uint256(claimedSizeMin)),
            claimedSizeMax: uint64(uint256(claimedSizeMax)),
            claimedFileType: claimedFileType,
            timestamp: block.timestamp,
            exists: true
        });

        disclosures[commitment].push(d);
        uint256 disclosureIndex = disclosures[commitment].length - 1;

        emit DisclosureSubmitted(msg.sender, commitment, disclosureIndex);
    }

    function verifyExistence(bytes32 commitment) external view returns (bool exists, address submitter, uint256 timestamp, uint256 blockNumber) {
        CommitmentData memory data = commitments[commitment];
        return (data.exists, data.submitter, data.timestamp, data.blockNumber);
    }

    function getUserCommitments(address user) external view returns (bytes32[] memory) {
        return userCommitments[user];
    }

    function getDisclosureCount(bytes32 commitment) external view returns (uint256) {
        return disclosures[commitment].length;
    }

    function getDisclosure(bytes32 commitment, uint256 index) external view returns (DisclosureData memory) {
        return disclosures[commitment][index];
    }

    function getDisclosureFlags(bytes32 commitment, uint256 index) external view returns (
        bool revealEmailDomain,
        bool revealSizeRange,
        bool revealFileType
    ) {
        DisclosureData memory d = disclosures[commitment][index];
        return (d.revealEmailDomain, d.revealSizeRange, d.revealFileType);
    }
}
