export const PROOF_OF_EXISTENCE_ADDRESS = '0x808101B5659608f58A8cEebd682D674B6d97B509'

export const PROOF_OF_EXISTENCE_ABI = [
    {
        inputs: [
            { internalType: 'address', name: '_timestampVerifier', type: 'address' },
            { internalType: 'address', name: '_disclosureVerifier', type: 'address' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    { inputs: [], name: 'CommitmentAlreadyExists', type: 'error' },
    { inputs: [], name: 'CommitmentDoesNotExist', type: 'error' },
    { inputs: [], name: 'EmptyBatch', type: 'error' },
    { inputs: [], name: 'InvalidProof', type: 'error' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'submitter', type: 'address' },
            { indexed: true, internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        name: 'CommitmentSubmitted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'submitter', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'count', type: 'uint256' },
        ],
        name: 'BatchCommitmentsSubmitted',
        type: 'event',
    },
    {
        inputs: [
            { internalType: 'bytes', name: 'proof', type: 'bytes' },
            { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
            { internalType: 'bytes32', name: 'timestampField', type: 'bytes32' },
        ],
        name: 'submitProof',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
        ],
        name: 'verifyExistence',
        outputs: [
            { internalType: 'bool', name: 'exists', type: 'bool' },
            { internalType: 'address', name: 'submitter', type: 'address' },
            { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
            { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'user', type: 'address' },
        ],
        name: 'getUserCommitments',
        outputs: [
            { internalType: 'bytes32[]', name: '', type: 'bytes32[]' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
        ],
        name: 'getDisclosureCount',
        outputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes', name: 'proof', type: 'bytes' },
            { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
            { internalType: 'bool', name: 'revealEmailDomain', type: 'bool' },
            { internalType: 'bool', name: 'revealSizeRange', type: 'bool' },
            { internalType: 'bool', name: 'revealFileType', type: 'bool' },
            { internalType: 'bytes32', name: 'claimedDomainHash', type: 'bytes32' },
            { internalType: 'bytes32', name: 'claimedSizeMin', type: 'bytes32' },
            { internalType: 'bytes32', name: 'claimedSizeMax', type: 'bytes32' },
            { internalType: 'bytes32[20]', name: 'claimedFileType', type: 'bytes32[20]' },
        ],
        name: 'submitDisclosure',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'submitter', type: 'address' },
            { indexed: true, internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
            { indexed: false, internalType: 'uint256', name: 'disclosureIndex', type: 'uint256' },
        ],
        name: 'DisclosureSubmitted',
        type: 'event',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
            { internalType: 'uint256', name: 'index', type: 'uint256' },
        ],
        name: 'getDisclosureFlags',
        outputs: [
            { internalType: 'bool', name: 'revealEmailDomain', type: 'bool' },
            { internalType: 'bool', name: 'revealSizeRange', type: 'bool' },
            { internalType: 'bool', name: 'revealFileType', type: 'bool' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
            { internalType: 'uint256', name: 'index', type: 'uint256' },
        ],
        name: 'getDisclosure',
        outputs: [
            {
                components: [
                    { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
                    { internalType: 'bool', name: 'revealEmailDomain', type: 'bool' },
                    { internalType: 'bool', name: 'revealSizeRange', type: 'bool' },
                    { internalType: 'bool', name: 'revealFileType', type: 'bool' },
                    { internalType: 'bytes32', name: 'claimedDomainHash', type: 'bytes32' },
                    { internalType: 'uint64', name: 'claimedSizeMin', type: 'uint64' },
                    { internalType: 'uint64', name: 'claimedSizeMax', type: 'uint64' },
                    { internalType: 'bytes32[20]', name: 'claimedFileType', type: 'bytes32[20]' },
                    { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
                    { internalType: 'bool', name: 'exists', type: 'bool' },
                ],
                internalType: 'struct ProofOfExistence.DisclosureData',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes32', name: '', type: 'bytes32' },
        ],
        name: 'commitments',
        outputs: [
            { internalType: 'address', name: 'submitter', type: 'address' },
            { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
            { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
            { internalType: 'bool', name: 'exists', type: 'bool' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]

export const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc'
export const ARBISCAN_URL = 'https://sepolia.arbiscan.io'
