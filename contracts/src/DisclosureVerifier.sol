// SPDX-License-Identifier: Apache-2.0
// Copyright 2022 Aztec
pragma solidity >=0.8.21;

uint256 constant D_N = 131072;
uint256 constant D_LOG_N = 17;
uint256 constant D_NUMBER_OF_PUBLIC_INPUTS = 43;
library DisclosureVerificationKey {
    function loadVerificationKey() internal pure returns (DisclosureHonk.VerificationKey memory) {
        DisclosureHonk.VerificationKey memory vk = DisclosureHonk.VerificationKey({
            circuitSize: uint256(131072),
            logCircuitSize: uint256(17),
            publicInputsSize: uint256(43),
            ql: DisclosureHonk.G1Point({ 
               x: uint256(0x028d7b1c7195762732298e5ed98a04398303456cee35d34ad03e634942ae0a52),
               y: uint256(0x2836a83bf49ec9ff2da7d5b70382add97f5c63f6c8705551dec3dace5d30ea2e)
            }),
            qr: DisclosureHonk.G1Point({ 
               x: uint256(0x1f45a6159b793f8d4b549c1b7c65c8063ff556cb2017095852abe3d32c50bbec),
               y: uint256(0x14220f355a0114b71d8e4cd875d1f3610224a8fc2f2c216e456cf857c8745366)
            }),
            qo: DisclosureHonk.G1Point({ 
               x: uint256(0x17ab08ffa2eec4ea853d3645dc075244947bee8261560a20971880652e6232a8),
               y: uint256(0x067f08e4210cfd6d57f0d1eefd50c82ac9fc6eeddad6044dec49305258b0e1a4)
            }),
            q4: DisclosureHonk.G1Point({ 
               x: uint256(0x2a1a58b508e7c4ffd4f5da00c781795b85daf68544b031ce0112502774960636),
               y: uint256(0x2edcb2b3abd554c998ea5323ae9f10d05a7bc610972f97c1c63d66d5721ea9d0)
            }),
            qm: DisclosureHonk.G1Point({ 
               x: uint256(0x054fd6876af1981f02fdc3b978824a41d295e2bb26a84b948c98f495eaec14cb),
               y: uint256(0x290575ac5dcae97043074fb6ab111fadaf0e3ebc2f6f8aa99e9e65ee26e4f61e)
            }),
            qc: DisclosureHonk.G1Point({ 
               x: uint256(0x1882b5040cd46a6d9af2bc3f57bfc68802adc751ad4233b4916fca80aab8ce41),
               y: uint256(0x2a475aaa6d27fa879a0d0e7067a7f0a61b3ef9773e7c90a73275611712af3465)
            }),
            qArith: DisclosureHonk.G1Point({ 
               x: uint256(0x199fa2a037fd5f08dee7d9f0616e6327ef8728995718fe4743a500089c9cf8ab),
               y: uint256(0x1ea5b4afdb86c1929d45fb4aedc002b3d9ad04bacc896854109887d84fe30d66)
            }),
            qDeltaRange: DisclosureHonk.G1Point({ 
               x: uint256(0x10d73faab68e619c5aa9f1c037b9027b31c80330ed33a9d296fbf84a4f1c00e4),
               y: uint256(0x0de3d30bb893ba81be4b0ab882f49cdcc251ef34f689bfd7398cd85d3663c0e2)
            }),
            qElliptic: DisclosureHonk.G1Point({ 
               x: uint256(0x22f01d494b1aad4aca04ad86555531e747f02c93a9f176eed9e57bd79ea02b89),
               y: uint256(0x05a36213cd4708356541fce171c56b51904920cc8a8edc9490359606e63d1a98)
            }),
            qAux: DisclosureHonk.G1Point({ 
               x: uint256(0x0e20d5bc95e01910302a5355775bfc1e70794f074dfa7206a37a88e4d002ab8b),
               y: uint256(0x02779e15d3c6db2f1b675970f2778cef30898d736140966d93a6a58cd36af750)
            }),
            qLookup: DisclosureHonk.G1Point({ 
               x: uint256(0x2cbf529d787d5142af21b8a9f4c2cf267cfe266fa1ec2b4222e115a171081840),
               y: uint256(0x2c3377bd3fe7bc8547311d8b843928d2b2c05ba32471a151adbd55629e73e2cc)
            }),
            qPoseidon2External: DisclosureHonk.G1Point({ 
               x: uint256(0x2ca87f994c62e2e95c9f17330118132d049645c81a9c6aa31fbd51cec719831a),
               y: uint256(0x2280f8cc50f1ecd707b042eac6407912079ffd4573ddd392a92a6ab5b7fc0cb8)
            }),
            qPoseidon2Internal: DisclosureHonk.G1Point({ 
               x: uint256(0x14a54355c584dfe03445945ef0ab1bcf780d4af61373ea79a91122c4a14c0919),
               y: uint256(0x252e82dab6fb880e100536e79d495afe6df8886ebff40a262603c8bd7fcabae1)
            }),
            s1: DisclosureHonk.G1Point({ 
               x: uint256(0x1e775e544a8c7dad21013f9b90e7856bafb1d91144ca666d5dd8f28f0e84a29a),
               y: uint256(0x2bf9443a430e5af8e61efc1d2eabe7f703e9204aa5c51783f8c9c72789698421)
            }),
            s2: DisclosureHonk.G1Point({ 
               x: uint256(0x11f225fdb8376a2ab5a52ee9febf8ef52df12f0876cced16ce42876bb27cc0fb),
               y: uint256(0x29f728433961195e3c0b1f7e8632757558fa5b74da58f3c45080ab641f07acce)
            }),
            s3: DisclosureHonk.G1Point({ 
               x: uint256(0x1297388bd6256d7078160528d7d5dd36dcd28ddc881eef4dbea24d42107ee5ec),
               y: uint256(0x04ec2ec0c346359d284a9a8f11861950d51feccbbb0fcbb318da7c72adc58e5f)
            }),
            s4: DisclosureHonk.G1Point({ 
               x: uint256(0x1e94d72cfaae3b24c83ac18de8db31ef1a79b5746fe3719ed230ba58f2c8ca5e),
               y: uint256(0x225c331e7f3da47456c16e562f8f0675a11b4997970a03bdf7785dc39202099e)
            }),
            t1: DisclosureHonk.G1Point({ 
               x: uint256(0x2aa031fcbca3c5415b90003ff2253023fd364066798c9bc4c313deaf589de4af),
               y: uint256(0x0632b018583d28b72d9e217224a51c27d1c0e6630ea9371bc55e02ddadf590e5)
            }),
            t2: DisclosureHonk.G1Point({ 
               x: uint256(0x053e9802f0c761982b687738231a3a7394ce7575e9b26068e69780fd0cbd087c),
               y: uint256(0x0ef47f4e6a6c0cf24bc4b73637a77d3db99f58f814474bc668c82c8a05218aba)
            }),
            t3: DisclosureHonk.G1Point({ 
               x: uint256(0x2e027ea1fbb9d1429d8f465e967b81c0c1ba30fe43e61db7a7ef6cf760cc2545),
               y: uint256(0x0d45c9306029c7ee41566f5efa56831ee3b94aff6a6704a823a5282449bf3fc5)
            }),
            t4: DisclosureHonk.G1Point({ 
               x: uint256(0x1e414aa26c8ba7fd12cbaadd72decff17fb35e6957a92806c740b9758f2d91c6),
               y: uint256(0x1db8c40805aaec02252ca77cffee225ce33104888b745dd0a8ec3e69e2839dba)
            }),
            id1: DisclosureHonk.G1Point({ 
               x: uint256(0x06bf0ff5f6ed73161d61c78dddbf67a7f61713bab6505de1cc6638994131902d),
               y: uint256(0x30072bf4440bca10dbeede921a7a30367f9d05b763f1dd8ae4eb1803d53fa208)
            }),
            id2: DisclosureHonk.G1Point({ 
               x: uint256(0x1039aa797f344894bf6f3c75829e18d167097ca2041fce9ec15b3cc71570165f),
               y: uint256(0x2aa627d4111915d68dd5628d6d6b9d17aaedf21899d37ef6faeee7aa10077fcb)
            }),
            id3: DisclosureHonk.G1Point({ 
               x: uint256(0x00214bd6ac649fd60d587d8b1cc632ace2650ed72c999a2a173bdc5188ff1c6b),
               y: uint256(0x14be80de13094fff2ba5b5b0cd5fae440ed008836cc692992c657bad5c932f11)
            }),
            id4: DisclosureHonk.G1Point({ 
               x: uint256(0x108f4fbbda0d27fb38946a2dec061b9beb892c0a9c1bf7e26934bf29d3b8ff6b),
               y: uint256(0x06a55ba29a187d4a65b71a553deb70c03ae70d8110034eb80555fc1dc6c5494a)
            }),
            lagrangeFirst: DisclosureHonk.G1Point({ 
               x: uint256(0x0000000000000000000000000000000000000000000000000000000000000001),
               y: uint256(0x0000000000000000000000000000000000000000000000000000000000000002)
            }),
            lagrangeLast: DisclosureHonk.G1Point({ 
               x: uint256(0x24bd76f1eb5ca772c57c5b7ebe1c9bd76f6e6b9409cc388e550f7ea9530318c4),
               y: uint256(0x21b0407f3c21addd867c154c9fc1905f7690d057a7ce1661ee24c604e8837895)
            })
        });
        return vk;
    }
}

pragma solidity ^0.8.27;

type DFr is uint256;

using { add as + } for DFr global;
using { sub as - } for DFr global;
using { mul as * } for DFr global;
using { exp as ^ } for DFr global;
using { notEqual as != } for DFr global;
using { equal as == } for DFr global;

uint256 constant D_MODULUS =
    21888242871839275222246405745257275088548364400416034343698204186575808495617; // Prime field order

DFr constant D_MINUS_ONE = DFr.wrap(D_MODULUS - 1);

// Instantiation
library DFrLib
{
    function from(uint256 value) internal pure returns(DFr)
    {
        return DFr.wrap(value % D_MODULUS);
    }

    function fromBytes32(bytes32 value) internal pure returns(DFr)
    {
        return DFr.wrap(uint256(value) % D_MODULUS);
    }

    function toBytes32(DFr value) internal pure returns(bytes32)
    {
        return bytes32(DFr.unwrap(value));
    }

    function invert(DFr value) internal view returns(DFr)
    {
        uint256 v = DFr.unwrap(value);
        uint256 result;

        // Call the modexp precompile to invert in the field
        assembly
        {
            let free := mload(0x40)
            mstore(free, 0x20)
            mstore(add(free, 0x20), 0x20)
            mstore(add(free, 0x40), 0x20)
            mstore(add(free, 0x60), v)
            mstore(add(free, 0x80), sub(D_MODULUS, 2))
            mstore(add(free, 0xa0), D_MODULUS)
            let success := staticcall(gas(), 0x05, free, 0xc0, 0x00, 0x20)
            if iszero(success) {
                revert(0, 0)
            }
            result := mload(0x00)
        }

        return DFr.wrap(result);
    }

    function pow(DFr base, uint256 v) internal view returns(DFr)
    {
        uint256 b = DFr.unwrap(base);
        uint256 result;

        // Call the modexp precompile to invert in the field
        assembly
        {
            let free := mload(0x40)
            mstore(free, 0x20)
            mstore(add(free, 0x20), 0x20)
            mstore(add(free, 0x40), 0x20)
            mstore(add(free, 0x60), b)
            mstore(add(free, 0x80), v)
            mstore(add(free, 0xa0), D_MODULUS)
            let success := staticcall(gas(), 0x05, free, 0xc0, 0x00, 0x20)
            if iszero(success) {
                revert(0, 0)
            }
            result := mload(0x00)
        }

        return DFr.wrap(result);
    }

    function div(DFr numerator, DFr denominator) internal view returns(DFr)
    {
        return numerator * invert(denominator);
    }

    function sqr(DFr value) internal pure returns (DFr) {
        return value * value;
    }

    function unwrap(DFr value) internal pure returns (uint256) {
        return DFr.unwrap(value);
    }

    function neg(DFr value) internal pure returns (DFr) {
        return DFr.wrap(D_MODULUS - DFr.unwrap(value));
    }
}

// Free functions
function add(DFr a, DFr b) pure returns(DFr)
{
    return DFr.wrap(addmod(DFr.unwrap(a), DFr.unwrap(b), D_MODULUS));
}

function mul(DFr a, DFr b) pure returns(DFr)
{
    return DFr.wrap(mulmod(DFr.unwrap(a), DFr.unwrap(b), D_MODULUS));
}

function sub(DFr a, DFr b) pure returns(DFr)
{
    return DFr.wrap(addmod(DFr.unwrap(a), D_MODULUS - DFr.unwrap(b), D_MODULUS));
}

function exp(DFr base, DFr exponent) pure returns(DFr)
{
    if (DFr.unwrap(exponent) == 0) return DFr.wrap(1);

    for (uint256 i = 1; i < DFr.unwrap(exponent); i += i) {
        base = base * base;
    }
    return base;
}

function notEqual(DFr a, DFr b) pure returns(bool)
{
    return DFr.unwrap(a) != DFr.unwrap(b);
}

function equal(DFr a, DFr b) pure returns(bool)
{
    return DFr.unwrap(a) == DFr.unwrap(b);
}

uint256 constant D_CONST_PROOF_SIZE_LOG_N = 28;

uint256 constant D_NUMBER_OF_SUBRELATIONS = 26;
uint256 constant D_BATCHED_RELATION_PARTIAL_LENGTH = 8;
uint256 constant D_NUMBER_OF_ENTITIES = 40;
uint256 constant D_NUMBER_UNSHIFTED = 35;
uint256 constant D_NUMBER_TO_BE_SHIFTED = 5;
uint256 constant D_PAIRING_POINTS_SIZE = 16;

// Alphas are used as relation separators so there should be D_NUMBER_OF_SUBRELATIONS - 1
uint256 constant D_NUMBER_OF_ALPHAS = 25;

// Prime field order
uint256 constant D_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583; // EC group order. F_q
uint256 constant D_P = 21888242871839275222246405745257275088548364400416034343698204186575808495617; // Prime field order, F_r

// ENUM FOR WIRES
enum D_WIRE {
    Q_M,
    Q_C,
    Q_L,
    Q_R,
    Q_O,
    Q_4,
    Q_LOOKUP,
    Q_ARITH,
    Q_RANGE,
    Q_ELLIPTIC,
    Q_AUX,
    Q_POSEIDON2_EXTERNAL,
    Q_POSEIDON2_INTERNAL,
    SIGMA_1,
    SIGMA_2,
    SIGMA_3,
    SIGMA_4,
    ID_1,
    ID_2,
    ID_3,
    ID_4,
    TABLE_1,
    TABLE_2,
    TABLE_3,
    TABLE_4,
    LAGRANGE_FIRST,
    LAGRANGE_LAST,
    W_L,
    W_R,
    W_O,
    W_4,
    Z_PERM,
    LOOKUP_INVERSES,
    LOOKUP_READ_COUNTS,
    LOOKUP_READ_TAGS,
    W_L_SHIFT,
    W_R_SHIFT,
    W_O_SHIFT,
    W_4_SHIFT,
    Z_PERM_SHIFT
}

library DisclosureHonk {
    struct G1Point {
        uint256 x;
        uint256 y;
    }

    struct G1ProofPoint {
        uint256 x_0;
        uint256 x_1;
        uint256 y_0;
        uint256 y_1;
    }

    struct VerificationKey {
        // Misc Params
        uint256 circuitSize;
        uint256 logCircuitSize;
        uint256 publicInputsSize;
        // Selectors
        G1Point qm;
        G1Point qc;
        G1Point ql;
        G1Point qr;
        G1Point qo;
        G1Point q4;
        G1Point qLookup; // Lookup
        G1Point qArith; // Arithmetic widget
        G1Point qDeltaRange; // Delta Range sort
        G1Point qAux; // Auxillary
        G1Point qElliptic; // Auxillary
        G1Point qPoseidon2External;
        G1Point qPoseidon2Internal;
        // Copy cnstraints
        G1Point s1;
        G1Point s2;
        G1Point s3;
        G1Point s4;
        // Copy identity
        G1Point id1;
        G1Point id2;
        G1Point id3;
        G1Point id4;
        // Precomputed lookup table
        G1Point t1;
        G1Point t2;
        G1Point t3;
        G1Point t4;
        // Fixed first and last
        G1Point lagrangeFirst;
        G1Point lagrangeLast;
    }

    struct RelationParameters {
        // challenges
        DFr eta;
        DFr etaTwo;
        DFr etaThree;
        DFr beta;
        DFr gamma;
        // derived
        DFr publicInputsDelta;
    }


    struct Proof {
        // Pairing point object
        DFr[D_PAIRING_POINTS_SIZE] pairingPointObject;
        // Free wires
        DisclosureHonk.G1ProofPoint w1;
        DisclosureHonk.G1ProofPoint w2;
        DisclosureHonk.G1ProofPoint w3;
        DisclosureHonk.G1ProofPoint w4;
        // Lookup helpers - Permutations
        DisclosureHonk.G1ProofPoint zPerm;
        // Lookup helpers - logup
        DisclosureHonk.G1ProofPoint lookupReadCounts;
        DisclosureHonk.G1ProofPoint lookupReadTags;
        DisclosureHonk.G1ProofPoint lookupInverses;
        // Sumcheck
        DFr[D_BATCHED_RELATION_PARTIAL_LENGTH][D_CONST_PROOF_SIZE_LOG_N] sumcheckUnivariates;
        DFr[D_NUMBER_OF_ENTITIES] sumcheckEvaluations;
        // Shplemini
        DisclosureHonk.G1ProofPoint[D_CONST_PROOF_SIZE_LOG_N - 1] geminiFoldComms;
        DFr[D_CONST_PROOF_SIZE_LOG_N] geminiAEvaluations;
        DisclosureHonk.G1ProofPoint shplonkQ;
        DisclosureHonk.G1ProofPoint kzgQuotient;
    }
}

// DTranscript library to generate fiat shamir challenges
struct DTranscript {
    // Oink
    DisclosureHonk.RelationParameters relationParameters;
    DFr[D_NUMBER_OF_ALPHAS] alphas;
    DFr[D_CONST_PROOF_SIZE_LOG_N] gateChallenges;
    // Sumcheck
    DFr[D_CONST_PROOF_SIZE_LOG_N] sumCheckUChallenges;
    // Gemini
    DFr rho;
    DFr geminiR;
    // Shplonk
    DFr shplonkNu;
    DFr shplonkZ;
}

library DTranscriptLib {
    function generateTranscript(DisclosureHonk.Proof memory proof, bytes32[] calldata publicInputs, uint256 circuitSize, uint256 publicInputsSize, uint256 pubInputsOffset)
        internal
        pure
        returns (DTranscript memory t)
    {
        DFr previousChallenge;
        (t.relationParameters, previousChallenge) =
            generateRelationParametersChallenges(proof, publicInputs, circuitSize, publicInputsSize, pubInputsOffset, previousChallenge);

        (t.alphas, previousChallenge) = generateAlphaChallenges(previousChallenge, proof);

        (t.gateChallenges, previousChallenge) = generateGateChallenges(previousChallenge);

        (t.sumCheckUChallenges, previousChallenge) = generateSumcheckChallenges(proof, previousChallenge);

        (t.rho, previousChallenge) = generateRhoChallenge(proof, previousChallenge);

        (t.geminiR, previousChallenge) = generateGeminiRChallenge(proof, previousChallenge);

        (t.shplonkNu, previousChallenge) = generateShplonkNuChallenge(proof, previousChallenge);

        (t.shplonkZ, previousChallenge) = generateShplonkZChallenge(proof, previousChallenge);

        return t;
    }

    function splitChallenge(DFr challenge) internal pure returns (DFr first, DFr second) {
        uint256 challengeU256 = uint256(DFr.unwrap(challenge));
        uint256 lo = challengeU256 & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        uint256 hi = challengeU256 >> 128;
        first = DFrLib.fromBytes32(bytes32(lo));
        second = DFrLib.fromBytes32(bytes32(hi));
    }

    function generateRelationParametersChallenges(
        DisclosureHonk.Proof memory proof,
        bytes32[] calldata publicInputs,
        uint256 circuitSize,
        uint256 publicInputsSize,
        uint256 pubInputsOffset,
        DFr previousChallenge
    ) internal pure returns (DisclosureHonk.RelationParameters memory rp, DFr nextPreviousChallenge) {
        (rp.eta, rp.etaTwo, rp.etaThree, previousChallenge) =
            generateEtaChallenge(proof, publicInputs, circuitSize, publicInputsSize, pubInputsOffset);

        (rp.beta, rp.gamma, nextPreviousChallenge) = generateBetaAndGammaChallenges(previousChallenge, proof);

    }

    function generateEtaChallenge(DisclosureHonk.Proof memory proof, bytes32[] calldata publicInputs, uint256 circuitSize, uint256 publicInputsSize, uint256 pubInputsOffset)
        internal
        pure
        returns (DFr eta, DFr etaTwo, DFr etaThree, DFr previousChallenge)
    {
        bytes32[] memory round0 = new bytes32[](3 + publicInputsSize + 12);
        round0[0] = bytes32(circuitSize);
        round0[1] = bytes32(publicInputsSize);
        round0[2] = bytes32(pubInputsOffset);
        // TODO(https://github.com/AztecProtocol/barretenberg/issues/1331): Consider making publicInputsSize not include pairing point object.
        for (uint256 i = 0; i < publicInputsSize - D_PAIRING_POINTS_SIZE; i++) {
            round0[3 + i] = bytes32(publicInputs[i]);
        }
        for (uint256 i = 0; i < D_PAIRING_POINTS_SIZE; i++) {
            round0[3 + publicInputsSize - D_PAIRING_POINTS_SIZE + i] = DFrLib.toBytes32(proof.pairingPointObject[i]);
        }

        // Create the first challenge
        // Note: w4 is added to the challenge later on
        round0[3 + publicInputsSize] = bytes32(proof.w1.x_0);
        round0[3 + publicInputsSize + 1] = bytes32(proof.w1.x_1);
        round0[3 + publicInputsSize + 2] = bytes32(proof.w1.y_0);
        round0[3 + publicInputsSize + 3] = bytes32(proof.w1.y_1);
        round0[3 + publicInputsSize + 4] = bytes32(proof.w2.x_0);
        round0[3 + publicInputsSize + 5] = bytes32(proof.w2.x_1);
        round0[3 + publicInputsSize + 6] = bytes32(proof.w2.y_0);
        round0[3 + publicInputsSize + 7] = bytes32(proof.w2.y_1);
        round0[3 + publicInputsSize + 8] = bytes32(proof.w3.x_0);
        round0[3 + publicInputsSize + 9] = bytes32(proof.w3.x_1);
        round0[3 + publicInputsSize + 10] = bytes32(proof.w3.y_0);
        round0[3 + publicInputsSize + 11] = bytes32(proof.w3.y_1);

        previousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(round0)));
        (eta, etaTwo) = splitChallenge(previousChallenge);
        previousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(DFr.unwrap(previousChallenge))));
        DFr unused;
        (etaThree, unused) = splitChallenge(previousChallenge);
    }

    function generateBetaAndGammaChallenges(DFr previousChallenge, DisclosureHonk.Proof memory proof)
        internal
        pure
        returns (DFr beta, DFr gamma, DFr nextPreviousChallenge)
    {
        bytes32[13] memory round1;
        round1[0] = DFrLib.toBytes32(previousChallenge);
        round1[1] = bytes32(proof.lookupReadCounts.x_0);
        round1[2] = bytes32(proof.lookupReadCounts.x_1);
        round1[3] = bytes32(proof.lookupReadCounts.y_0);
        round1[4] = bytes32(proof.lookupReadCounts.y_1);
        round1[5] = bytes32(proof.lookupReadTags.x_0);
        round1[6] = bytes32(proof.lookupReadTags.x_1);
        round1[7] = bytes32(proof.lookupReadTags.y_0);
        round1[8] = bytes32(proof.lookupReadTags.y_1);
        round1[9] = bytes32(proof.w4.x_0);
        round1[10] = bytes32(proof.w4.x_1);
        round1[11] = bytes32(proof.w4.y_0);
        round1[12] = bytes32(proof.w4.y_1);

        nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(round1)));
        (beta, gamma) = splitChallenge(nextPreviousChallenge);
    }

    // Alpha challenges non-linearise the gate contributions
    function generateAlphaChallenges(DFr previousChallenge, DisclosureHonk.Proof memory proof)
        internal
        pure
        returns (DFr[D_NUMBER_OF_ALPHAS] memory alphas, DFr nextPreviousChallenge)
    {
        // Generate the original sumcheck alpha 0 by hashing zPerm and zLookup
        uint256[9] memory alpha0;
        alpha0[0] = DFr.unwrap(previousChallenge);
        alpha0[1] = proof.lookupInverses.x_0;
        alpha0[2] = proof.lookupInverses.x_1;
        alpha0[3] = proof.lookupInverses.y_0;
        alpha0[4] = proof.lookupInverses.y_1;
        alpha0[5] = proof.zPerm.x_0;
        alpha0[6] = proof.zPerm.x_1;
        alpha0[7] = proof.zPerm.y_0;
        alpha0[8] = proof.zPerm.y_1;

        nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(alpha0)));
        (alphas[0], alphas[1]) = splitChallenge(nextPreviousChallenge);

        for (uint256 i = 1; i < D_NUMBER_OF_ALPHAS / 2; i++) {
            nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(DFr.unwrap(nextPreviousChallenge))));
            (alphas[2 * i], alphas[2 * i + 1]) = splitChallenge(nextPreviousChallenge);
        }
        if (((D_NUMBER_OF_ALPHAS & 1) == 1) && (D_NUMBER_OF_ALPHAS > 2)) {
            nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(DFr.unwrap(nextPreviousChallenge))));
            DFr unused;
            (alphas[D_NUMBER_OF_ALPHAS - 1], unused) = splitChallenge(nextPreviousChallenge);
        }
    }

    function generateGateChallenges(DFr previousChallenge)
        internal
        pure
        returns (DFr[D_CONST_PROOF_SIZE_LOG_N] memory gateChallenges, DFr nextPreviousChallenge)
    {
        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N; i++) {
            previousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(DFr.unwrap(previousChallenge))));
            DFr unused;
            (gateChallenges[i], unused) = splitChallenge(previousChallenge);
        }
        nextPreviousChallenge = previousChallenge;
    }

    function generateSumcheckChallenges(DisclosureHonk.Proof memory proof, DFr prevChallenge)
        internal
        pure
        returns (DFr[D_CONST_PROOF_SIZE_LOG_N] memory sumcheckChallenges, DFr nextPreviousChallenge)
    {
        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N; i++) {
            DFr[D_BATCHED_RELATION_PARTIAL_LENGTH + 1] memory univariateChal;
            univariateChal[0] = prevChallenge;

            for (uint256 j = 0; j < D_BATCHED_RELATION_PARTIAL_LENGTH; j++) {
                univariateChal[j + 1] = proof.sumcheckUnivariates[i][j];
            }
            prevChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(univariateChal)));
            DFr unused;
            (sumcheckChallenges[i], unused) = splitChallenge(prevChallenge);
        }
        nextPreviousChallenge = prevChallenge;
    }

    function generateRhoChallenge(DisclosureHonk.Proof memory proof, DFr prevChallenge)
        internal
        pure
        returns (DFr rho, DFr nextPreviousChallenge)
    {
        DFr[D_NUMBER_OF_ENTITIES + 1] memory rhoChallengeElements;
        rhoChallengeElements[0] = prevChallenge;

        for (uint256 i = 0; i < D_NUMBER_OF_ENTITIES; i++) {
            rhoChallengeElements[i + 1] = proof.sumcheckEvaluations[i];
        }

        nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(rhoChallengeElements)));
        DFr unused;
        (rho, unused) = splitChallenge(nextPreviousChallenge);
    }

    function generateGeminiRChallenge(DisclosureHonk.Proof memory proof, DFr prevChallenge)
        internal
        pure
        returns (DFr geminiR, DFr nextPreviousChallenge)
    {
        uint256[(D_CONST_PROOF_SIZE_LOG_N - 1) * 4 + 1] memory gR;
        gR[0] = DFr.unwrap(prevChallenge);

        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N - 1; i++) {
            gR[1 + i * 4] = proof.geminiFoldComms[i].x_0;
            gR[2 + i * 4] = proof.geminiFoldComms[i].x_1;
            gR[3 + i * 4] = proof.geminiFoldComms[i].y_0;
            gR[4 + i * 4] = proof.geminiFoldComms[i].y_1;
        }

        nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(gR)));
        DFr unused;
        (geminiR, unused) = splitChallenge(nextPreviousChallenge);
    }

    function generateShplonkNuChallenge(DisclosureHonk.Proof memory proof, DFr prevChallenge)
        internal
        pure
        returns (DFr shplonkNu, DFr nextPreviousChallenge)
    {
        uint256[(D_CONST_PROOF_SIZE_LOG_N) + 1] memory shplonkNuChallengeElements;
        shplonkNuChallengeElements[0] = DFr.unwrap(prevChallenge);

        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N; i++) {
            shplonkNuChallengeElements[i + 1] = DFr.unwrap(proof.geminiAEvaluations[i]);
        }

        nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(shplonkNuChallengeElements)));
        DFr unused;
        (shplonkNu, unused) = splitChallenge(nextPreviousChallenge);
    }

    function generateShplonkZChallenge(DisclosureHonk.Proof memory proof, DFr prevChallenge)
        internal
        pure
        returns (DFr shplonkZ, DFr nextPreviousChallenge)
    {
        uint256[5] memory shplonkZChallengeElements;
        shplonkZChallengeElements[0] = DFr.unwrap(prevChallenge);

        shplonkZChallengeElements[1] = proof.shplonkQ.x_0;
        shplonkZChallengeElements[2] = proof.shplonkQ.x_1;
        shplonkZChallengeElements[3] = proof.shplonkQ.y_0;
        shplonkZChallengeElements[4] = proof.shplonkQ.y_1;

        nextPreviousChallenge = DFrLib.fromBytes32(keccak256(abi.encodePacked(shplonkZChallengeElements)));
        DFr unused;
        (shplonkZ, unused) = splitChallenge(nextPreviousChallenge);
    }

    function loadProof(bytes calldata proof) internal pure returns (DisclosureHonk.Proof memory p) {
        // TODO(https://github.com/AztecProtocol/barretenberg/issues/1332): Optimize this away when we finalize.
        uint256 boundary = 0x0;

        // Pairing point object
        for (uint256 i = 0; i < D_PAIRING_POINTS_SIZE; i++) {
            p.pairingPointObject[i] = dBytesToFr(proof[boundary:boundary + 0x20]);
            boundary += 0x20;
        }
        // Commitments
        p.w1 = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        p.w2 = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        p.w3 = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;

        // Lookup / Permutation Helper Commitments
        p.lookupReadCounts = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        p.lookupReadTags = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        p.w4 = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        p.lookupInverses = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        p.zPerm = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;

        // Sumcheck univariates
        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N; i++) {
            for (uint256 j = 0; j < D_BATCHED_RELATION_PARTIAL_LENGTH; j++) {
                p.sumcheckUnivariates[i][j] = dBytesToFr(proof[boundary:boundary + 0x20]);
                boundary += 0x20;
            }
        }
        // Sumcheck evaluations
        for (uint256 i = 0; i < D_NUMBER_OF_ENTITIES; i++) {
            p.sumcheckEvaluations[i] = dBytesToFr(proof[boundary:boundary + 0x20]);
            boundary += 0x20;
        }

        // Gemini
        // Read gemini fold univariates
        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N - 1; i++) {
            p.geminiFoldComms[i] = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
            boundary += 0x80;
        }

        // Read gemini a evaluations
        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N; i++) {
            p.geminiAEvaluations[i] = dBytesToFr(proof[boundary:boundary + 0x20]);
            boundary += 0x20;
        }

        // Shplonk
        p.shplonkQ = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
        boundary += 0x80;
        // KZG
        p.kzgQuotient = dBytesToG1ProofPoint(proof[boundary:boundary + 0x80]);
    }
}


// DFr utility

function dBytesToFr(bytes calldata proofSection) pure returns (DFr scalar) {
    require(proofSection.length == 0x20, "invalid bytes scalar");
    scalar = DFrLib.fromBytes32(bytes32(proofSection));
}

// EC Point utilities
function convertProofPoint(DisclosureHonk.G1ProofPoint memory input) pure returns (DisclosureHonk.G1Point memory) {
    return DisclosureHonk.G1Point({x: input.x_0 | (input.x_1 << 136), y: input.y_0 | (input.y_1 << 136)});
}

function dBytesToG1ProofPoint(bytes calldata proofSection) pure returns (DisclosureHonk.G1ProofPoint memory point) {
    require(proofSection.length == 0x80, "invalid bytes point");
    point = DisclosureHonk.G1ProofPoint({
        x_0: uint256(bytes32(proofSection[0x00:0x20])),
        x_1: uint256(bytes32(proofSection[0x20:0x40])),
        y_0: uint256(bytes32(proofSection[0x40:0x60])),
        y_1: uint256(bytes32(proofSection[0x60:0x80]))
    });
}

function negateInplace(DisclosureHonk.G1Point memory point) pure returns (DisclosureHonk.G1Point memory) {
    point.y = (D_Q - point.y) % D_Q;
    return point;
}

 function pairing(DisclosureHonk.G1Point memory rhs, DisclosureHonk.G1Point memory lhs) view returns (bool) {
        bytes memory input = abi.encodePacked(
            rhs.x,
            rhs.y,
            // Fixed G1 point
            uint256(0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2),
            uint256(0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed),
            uint256(0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b),
            uint256(0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa),
            lhs.x,
            lhs.y,
            // G1 point from VK
            uint256(0x260e01b251f6f1c7e7ff4e580791dee8ea51d87a358e038b4efe30fac09383c1),
            uint256(0x0118c4d5b837bcc2bc89b5b398b5974e9f5944073b32078b7e231fec938883b0),
            uint256(0x04fc6369f7110fe3d25156c1bb9a72859cf2a04641f99ba4ee413c80da6a5fe4),
            uint256(0x22febda3c0c0632a56475b4214e5615e11e6dd3f96e6cea2854a87d4dacc5e55)
        );

        (bool success, bytes memory result) = address(0x08).staticcall(input);
        bool decodedResult = abi.decode(result, (bool));
        return success && decodedResult;
    }


library DRelationsLib {
    DFr internal constant GRUMPKIN_CURVE_B_PARAMETER_NEGATED = DFr.wrap(17); // -(-17)

    function accumulateRelationEvaluations(
         DFr[D_NUMBER_OF_ENTITIES] memory purportedEvaluations,
        DisclosureHonk.RelationParameters memory rp,
        DFr[D_NUMBER_OF_ALPHAS] memory alphas,
        DFr powPartialEval
    ) internal pure returns (DFr accumulator) {
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evaluations;

        // Accumulate all relations in Ultra Honk - each with varying number of subrelations
        accumulateArithmeticRelation(purportedEvaluations, evaluations, powPartialEval);
        accumulatePermutationRelation(purportedEvaluations, rp, evaluations, powPartialEval);
        accumulateLogDerivativeLookupRelation(purportedEvaluations, rp, evaluations, powPartialEval);
        accumulateDeltaRangeRelation(purportedEvaluations, evaluations, powPartialEval);
        accumulateEllipticRelation(purportedEvaluations, evaluations, powPartialEval);
        accumulateAuxillaryRelation(purportedEvaluations, rp, evaluations, powPartialEval);
        accumulatePoseidonExternalRelation(purportedEvaluations, evaluations, powPartialEval);
        accumulatePoseidonInternalRelation(purportedEvaluations, evaluations, powPartialEval);
        // batch the subrelations with the alpha challenges to obtain the full honk relation
        accumulator = scaleAndBatchSubrelations(evaluations, alphas);
    }

    /**
     * Aesthetic helper function that is used to index by enum into proof.sumcheckEvaluations, it avoids
     * the relation checking code being cluttered with uint256 type casting, which is often a different colour in code
     * editors, and thus is noisy.
     */
    function wire(DFr[D_NUMBER_OF_ENTITIES] memory p, D_WIRE _wire) internal pure returns (DFr) {
        return p[uint256(_wire)];
    }

    uint256 internal constant NEG_HALF_MODULO_P = 0x183227397098d014dc2822db40c0ac2e9419f4243cdcb848a1f0fac9f8000000;
    /**
     * Ultra Arithmetic Relation
     *
     */
    function accumulateArithmeticRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        // Relation 0
        DFr q_arith = wire(p, D_WIRE.Q_ARITH);
        {
            DFr neg_half = DFr.wrap(NEG_HALF_MODULO_P);

            DFr accum = (q_arith - DFr.wrap(3)) * (wire(p, D_WIRE.Q_M) * wire(p, D_WIRE.W_R) * wire(p, D_WIRE.W_L)) * neg_half;
            accum = accum + (wire(p, D_WIRE.Q_L) * wire(p, D_WIRE.W_L)) + (wire(p, D_WIRE.Q_R) * wire(p, D_WIRE.W_R))
                + (wire(p, D_WIRE.Q_O) * wire(p, D_WIRE.W_O)) + (wire(p, D_WIRE.Q_4) * wire(p, D_WIRE.W_4)) + wire(p, D_WIRE.Q_C);
            accum = accum + (q_arith - DFr.wrap(1)) * wire(p, D_WIRE.W_4_SHIFT);
            accum = accum * q_arith;
            accum = accum * domainSep;
            evals[0] = accum;
        }

        // Relation 1
        {
            DFr accum = wire(p, D_WIRE.W_L) + wire(p, D_WIRE.W_4) - wire(p, D_WIRE.W_L_SHIFT) + wire(p, D_WIRE.Q_M);
            accum = accum * (q_arith - DFr.wrap(2));
            accum = accum * (q_arith - DFr.wrap(1));
            accum = accum * q_arith;
            accum = accum * domainSep;
            evals[1] = accum;
        }
    }

    function accumulatePermutationRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DisclosureHonk.RelationParameters memory rp,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        DFr grand_product_numerator;
        DFr grand_product_denominator;

        {
            DFr num = wire(p, D_WIRE.W_L) + wire(p, D_WIRE.ID_1) * rp.beta + rp.gamma;
            num = num * (wire(p, D_WIRE.W_R) + wire(p, D_WIRE.ID_2) * rp.beta + rp.gamma);
            num = num * (wire(p, D_WIRE.W_O) + wire(p, D_WIRE.ID_3) * rp.beta + rp.gamma);
            num = num * (wire(p, D_WIRE.W_4) + wire(p, D_WIRE.ID_4) * rp.beta + rp.gamma);

            grand_product_numerator = num;
        }
        {
            DFr den = wire(p, D_WIRE.W_L) + wire(p, D_WIRE.SIGMA_1) * rp.beta + rp.gamma;
            den = den * (wire(p, D_WIRE.W_R) + wire(p, D_WIRE.SIGMA_2) * rp.beta + rp.gamma);
            den = den * (wire(p, D_WIRE.W_O) + wire(p, D_WIRE.SIGMA_3) * rp.beta + rp.gamma);
            den = den * (wire(p, D_WIRE.W_4) + wire(p, D_WIRE.SIGMA_4) * rp.beta + rp.gamma);

            grand_product_denominator = den;
        }

        // Contribution 2
        {
            DFr acc = (wire(p, D_WIRE.Z_PERM) + wire(p, D_WIRE.LAGRANGE_FIRST)) * grand_product_numerator;

            acc = acc
                - (
                    (wire(p, D_WIRE.Z_PERM_SHIFT) + (wire(p, D_WIRE.LAGRANGE_LAST) * rp.publicInputsDelta))
                        * grand_product_denominator
                );
            acc = acc * domainSep;
            evals[2] = acc;
        }

        // Contribution 3
        {
            DFr acc = (wire(p, D_WIRE.LAGRANGE_LAST) * wire(p, D_WIRE.Z_PERM_SHIFT)) * domainSep;
            evals[3] = acc;
        }
    }

    function accumulateLogDerivativeLookupRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DisclosureHonk.RelationParameters memory rp,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        DFr write_term;
        DFr read_term;

        // Calculate the write term (the table accumulation)
        {
            write_term = wire(p, D_WIRE.TABLE_1) + rp.gamma + (wire(p, D_WIRE.TABLE_2) * rp.eta)
                + (wire(p, D_WIRE.TABLE_3) * rp.etaTwo) + (wire(p, D_WIRE.TABLE_4) * rp.etaThree);
        }

        // Calculate the write term
        {
            DFr derived_entry_1 = wire(p, D_WIRE.W_L) + rp.gamma + (wire(p, D_WIRE.Q_R) * wire(p, D_WIRE.W_L_SHIFT));
            DFr derived_entry_2 = wire(p, D_WIRE.W_R) + wire(p, D_WIRE.Q_M) * wire(p, D_WIRE.W_R_SHIFT);
            DFr derived_entry_3 = wire(p, D_WIRE.W_O) + wire(p, D_WIRE.Q_C) * wire(p, D_WIRE.W_O_SHIFT);

            read_term = derived_entry_1 + (derived_entry_2 * rp.eta) + (derived_entry_3 * rp.etaTwo)
                + (wire(p, D_WIRE.Q_O) * rp.etaThree);
        }

        DFr read_inverse = wire(p, D_WIRE.LOOKUP_INVERSES) * write_term;
        DFr write_inverse = wire(p, D_WIRE.LOOKUP_INVERSES) * read_term;

        DFr inverse_exists_xor = wire(p, D_WIRE.LOOKUP_READ_TAGS) + wire(p, D_WIRE.Q_LOOKUP)
            - (wire(p, D_WIRE.LOOKUP_READ_TAGS) * wire(p, D_WIRE.Q_LOOKUP));

        // Inverse calculated correctly relation
        DFr accumulatorNone = read_term * write_term * wire(p, D_WIRE.LOOKUP_INVERSES) - inverse_exists_xor;
        accumulatorNone = accumulatorNone * domainSep;

        // Inverse
        DFr accumulatorOne = wire(p, D_WIRE.Q_LOOKUP) * read_inverse - wire(p, D_WIRE.LOOKUP_READ_COUNTS) * write_inverse;

        evals[4] = accumulatorNone;
        evals[5] = accumulatorOne;
    }

    function accumulateDeltaRangeRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        DFr minus_one = DFr.wrap(0) - DFr.wrap(1);
        DFr minus_two = DFr.wrap(0) - DFr.wrap(2);
        DFr minus_three = DFr.wrap(0) - DFr.wrap(3);

        // Compute wire differences
        DFr delta_1 = wire(p, D_WIRE.W_R) - wire(p, D_WIRE.W_L);
        DFr delta_2 = wire(p, D_WIRE.W_O) - wire(p, D_WIRE.W_R);
        DFr delta_3 = wire(p, D_WIRE.W_4) - wire(p, D_WIRE.W_O);
        DFr delta_4 = wire(p, D_WIRE.W_L_SHIFT) - wire(p, D_WIRE.W_4);

        // Contribution 6
        {
            DFr acc = delta_1;
            acc = acc * (delta_1 + minus_one);
            acc = acc * (delta_1 + minus_two);
            acc = acc * (delta_1 + minus_three);
            acc = acc * wire(p, D_WIRE.Q_RANGE);
            acc = acc * domainSep;
            evals[6] = acc;
        }

        // Contribution 7
        {
            DFr acc = delta_2;
            acc = acc * (delta_2 + minus_one);
            acc = acc * (delta_2 + minus_two);
            acc = acc * (delta_2 + minus_three);
            acc = acc * wire(p, D_WIRE.Q_RANGE);
            acc = acc * domainSep;
            evals[7] = acc;
        }

        // Contribution 8
        {
            DFr acc = delta_3;
            acc = acc * (delta_3 + minus_one);
            acc = acc * (delta_3 + minus_two);
            acc = acc * (delta_3 + minus_three);
            acc = acc * wire(p, D_WIRE.Q_RANGE);
            acc = acc * domainSep;
            evals[8] = acc;
        }

        // Contribution 9
        {
            DFr acc = delta_4;
            acc = acc * (delta_4 + minus_one);
            acc = acc * (delta_4 + minus_two);
            acc = acc * (delta_4 + minus_three);
            acc = acc * wire(p, D_WIRE.Q_RANGE);
            acc = acc * domainSep;
            evals[9] = acc;
        }
    }

    struct EllipticParams {
        // Points
        DFr x_1;
        DFr y_1;
        DFr x_2;
        DFr y_2;
        DFr y_3;
        DFr x_3;
        // push accumulators into memory
        DFr x_double_identity;
    }

    function accumulateEllipticRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        EllipticParams memory ep;
        ep.x_1 = wire(p, D_WIRE.W_R);
        ep.y_1 = wire(p, D_WIRE.W_O);

        ep.x_2 = wire(p, D_WIRE.W_L_SHIFT);
        ep.y_2 = wire(p, D_WIRE.W_4_SHIFT);
        ep.y_3 = wire(p, D_WIRE.W_O_SHIFT);
        ep.x_3 = wire(p, D_WIRE.W_R_SHIFT);

        DFr q_sign = wire(p, D_WIRE.Q_L);
        DFr q_is_double = wire(p, D_WIRE.Q_M);

        // Contribution 10 point addition, x-coordinate check
        // q_elliptic * (x3 + x2 + x1)(x2 - x1)(x2 - x1) - y2^2 - y1^2 + 2(y2y1)*q_sign = 0
        DFr x_diff = (ep.x_2 - ep.x_1);
        DFr y1_sqr = (ep.y_1 * ep.y_1);
        {
            // Move to top
            DFr partialEval = domainSep;

            DFr y2_sqr = (ep.y_2 * ep.y_2);
            DFr y1y2 = ep.y_1 * ep.y_2 * q_sign;
            DFr x_add_identity = (ep.x_3 + ep.x_2 + ep.x_1);
            x_add_identity = x_add_identity * x_diff * x_diff;
            x_add_identity = x_add_identity - y2_sqr - y1_sqr + y1y2 + y1y2;

            evals[10] = x_add_identity * partialEval * wire(p, D_WIRE.Q_ELLIPTIC) * (DFr.wrap(1) - q_is_double);
        }

        // Contribution 11 point addition, x-coordinate check
        // q_elliptic * (q_sign * y1 + y3)(x2 - x1) + (x3 - x1)(y2 - q_sign * y1) = 0
        {
            DFr y1_plus_y3 = ep.y_1 + ep.y_3;
            DFr y_diff = ep.y_2 * q_sign - ep.y_1;
            DFr y_add_identity = y1_plus_y3 * x_diff + (ep.x_3 - ep.x_1) * y_diff;
            evals[11] = y_add_identity * domainSep * wire(p, D_WIRE.Q_ELLIPTIC) * (DFr.wrap(1) - q_is_double);
        }

        // Contribution 10 point doubling, x-coordinate check
        // (x3 + x1 + x1) (4y1*y1) - 9 * x1 * x1 * x1 * x1 = 0
        // D_N.B. we're using the equivalence x1*x1*x1 === y1*y1 - curve_b to reduce degree by 1
        {
            DFr x_pow_4 = (y1_sqr + GRUMPKIN_CURVE_B_PARAMETER_NEGATED) * ep.x_1;
            DFr y1_sqr_mul_4 = y1_sqr + y1_sqr;
            y1_sqr_mul_4 = y1_sqr_mul_4 + y1_sqr_mul_4;
            DFr x1_pow_4_mul_9 = x_pow_4 * DFr.wrap(9);

            // NOTE: pushed into memory (stack >:'( )
            ep.x_double_identity = (ep.x_3 + ep.x_1 + ep.x_1) * y1_sqr_mul_4 - x1_pow_4_mul_9;

            DFr acc = ep.x_double_identity * domainSep * wire(p, D_WIRE.Q_ELLIPTIC) * q_is_double;
            evals[10] = evals[10] + acc;
        }

        // Contribution 11 point doubling, y-coordinate check
        // (y1 + y1) (2y1) - (3 * x1 * x1)(x1 - x3) = 0
        {
            DFr x1_sqr_mul_3 = (ep.x_1 + ep.x_1 + ep.x_1) * ep.x_1;
            DFr y_double_identity = x1_sqr_mul_3 * (ep.x_1 - ep.x_3) - (ep.y_1 + ep.y_1) * (ep.y_1 + ep.y_3);
            evals[11] = evals[11] + y_double_identity * domainSep * wire(p, D_WIRE.Q_ELLIPTIC) * q_is_double;
        }
    }

    // Constants for the auxiliary relation
    DFr constant LIMB_SIZE = DFr.wrap(uint256(1) << 68);
    DFr constant SUBLIMB_SHIFT = DFr.wrap(uint256(1) << 14);

    // Parameters used within the Auxiliary Relation
    // A struct is used to work around stack too deep. This relation has alot of variables
    struct AuxParams {
        DFr limb_subproduct;
        DFr non_native_field_gate_1;
        DFr non_native_field_gate_2;
        DFr non_native_field_gate_3;
        DFr limb_accumulator_1;
        DFr limb_accumulator_2;
        DFr memory_record_check;
        DFr partial_record_check;
        DFr next_gate_access_type;
        DFr record_delta;
        DFr index_delta;
        DFr adjacent_values_match_if_adjacent_indices_match;
        DFr adjacent_values_match_if_adjacent_indices_match_and_next_access_is_a_read_operation;
        DFr access_check;
        DFr next_gate_access_type_is_boolean;
        DFr ROM_consistency_check_identity;
        DFr RAM_consistency_check_identity;
        DFr timestamp_delta;
        DFr RAM_timestamp_check_identity;
        DFr memory_identity;
        DFr index_is_monotonically_increasing;
        DFr auxiliary_identity;
    }

    function accumulateAuxillaryRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DisclosureHonk.RelationParameters memory rp,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        AuxParams memory ap;

        /**
         * Contribution 12
         * Non native field arithmetic gate 2
         * deg 4
         *
         *             _                                                                               _
         *            /   _                   _                               _       14                \
         * q_2 . q_4 |   (w_1 . w_2) + (w_1 . w_2) + (w_1 . w_4 + w_2 . w_3 - w_3) . 2    - w_3 - w_4   |
         *            \_                                                                               _/
         *
         *
         */
        ap.limb_subproduct = wire(p, D_WIRE.W_L) * wire(p, D_WIRE.W_R_SHIFT) + wire(p, D_WIRE.W_L_SHIFT) * wire(p, D_WIRE.W_R);
        ap.non_native_field_gate_2 =
            (wire(p, D_WIRE.W_L) * wire(p, D_WIRE.W_4) + wire(p, D_WIRE.W_R) * wire(p, D_WIRE.W_O) - wire(p, D_WIRE.W_O_SHIFT));
        ap.non_native_field_gate_2 = ap.non_native_field_gate_2 * LIMB_SIZE;
        ap.non_native_field_gate_2 = ap.non_native_field_gate_2 - wire(p, D_WIRE.W_4_SHIFT);
        ap.non_native_field_gate_2 = ap.non_native_field_gate_2 + ap.limb_subproduct;
        ap.non_native_field_gate_2 = ap.non_native_field_gate_2 * wire(p, D_WIRE.Q_4);

        ap.limb_subproduct = ap.limb_subproduct * LIMB_SIZE;
        ap.limb_subproduct = ap.limb_subproduct + (wire(p, D_WIRE.W_L_SHIFT) * wire(p, D_WIRE.W_R_SHIFT));
        ap.non_native_field_gate_1 = ap.limb_subproduct;
        ap.non_native_field_gate_1 = ap.non_native_field_gate_1 - (wire(p, D_WIRE.W_O) + wire(p, D_WIRE.W_4));
        ap.non_native_field_gate_1 = ap.non_native_field_gate_1 * wire(p, D_WIRE.Q_O);

        ap.non_native_field_gate_3 = ap.limb_subproduct;
        ap.non_native_field_gate_3 = ap.non_native_field_gate_3 + wire(p, D_WIRE.W_4);
        ap.non_native_field_gate_3 = ap.non_native_field_gate_3 - (wire(p, D_WIRE.W_O_SHIFT) + wire(p, D_WIRE.W_4_SHIFT));
        ap.non_native_field_gate_3 = ap.non_native_field_gate_3 * wire(p, D_WIRE.Q_M);

        DFr non_native_field_identity =
            ap.non_native_field_gate_1 + ap.non_native_field_gate_2 + ap.non_native_field_gate_3;
        non_native_field_identity = non_native_field_identity * wire(p, D_WIRE.Q_R);

        // ((((w2' * 2^14 + w1') * 2^14 + w3) * 2^14 + w2) * 2^14 + w1 - w4) * qm
        // deg 2
        ap.limb_accumulator_1 = wire(p, D_WIRE.W_R_SHIFT) * SUBLIMB_SHIFT;
        ap.limb_accumulator_1 = ap.limb_accumulator_1 + wire(p, D_WIRE.W_L_SHIFT);
        ap.limb_accumulator_1 = ap.limb_accumulator_1 * SUBLIMB_SHIFT;
        ap.limb_accumulator_1 = ap.limb_accumulator_1 + wire(p, D_WIRE.W_O);
        ap.limb_accumulator_1 = ap.limb_accumulator_1 * SUBLIMB_SHIFT;
        ap.limb_accumulator_1 = ap.limb_accumulator_1 + wire(p, D_WIRE.W_R);
        ap.limb_accumulator_1 = ap.limb_accumulator_1 * SUBLIMB_SHIFT;
        ap.limb_accumulator_1 = ap.limb_accumulator_1 + wire(p, D_WIRE.W_L);
        ap.limb_accumulator_1 = ap.limb_accumulator_1 - wire(p, D_WIRE.W_4);
        ap.limb_accumulator_1 = ap.limb_accumulator_1 * wire(p, D_WIRE.Q_4);

        // ((((w3' * 2^14 + w2') * 2^14 + w1') * 2^14 + w4) * 2^14 + w3 - w4') * qm
        // deg 2
        ap.limb_accumulator_2 = wire(p, D_WIRE.W_O_SHIFT) * SUBLIMB_SHIFT;
        ap.limb_accumulator_2 = ap.limb_accumulator_2 + wire(p, D_WIRE.W_R_SHIFT);
        ap.limb_accumulator_2 = ap.limb_accumulator_2 * SUBLIMB_SHIFT;
        ap.limb_accumulator_2 = ap.limb_accumulator_2 + wire(p, D_WIRE.W_L_SHIFT);
        ap.limb_accumulator_2 = ap.limb_accumulator_2 * SUBLIMB_SHIFT;
        ap.limb_accumulator_2 = ap.limb_accumulator_2 + wire(p, D_WIRE.W_4);
        ap.limb_accumulator_2 = ap.limb_accumulator_2 * SUBLIMB_SHIFT;
        ap.limb_accumulator_2 = ap.limb_accumulator_2 + wire(p, D_WIRE.W_O);
        ap.limb_accumulator_2 = ap.limb_accumulator_2 - wire(p, D_WIRE.W_4_SHIFT);
        ap.limb_accumulator_2 = ap.limb_accumulator_2 * wire(p, D_WIRE.Q_M);

        DFr limb_accumulator_identity = ap.limb_accumulator_1 + ap.limb_accumulator_2;
        limb_accumulator_identity = limb_accumulator_identity * wire(p, D_WIRE.Q_O); //  deg 3

        /**
         * MEMORY
         *
         * A RAM memory record contains a tuple of the following fields:
         *  * i: `index` of memory cell being accessed
         *  * t: `timestamp` of memory cell being accessed (used for RAM, set to 0 for ROM)
         *  * v: `value` of memory cell being accessed
         *  * a: `access` type of record. read: 0 = read, 1 = write
         *  * r: `record` of memory cell. record = access + index * eta + timestamp * eta_two + value * eta_three
         *
         * A ROM memory record contains a tuple of the following fields:
         *  * i: `index` of memory cell being accessed
         *  * v: `value1` of memory cell being accessed (ROM tables can store up to 2 values per index)
         *  * v2:`value2` of memory cell being accessed (ROM tables can store up to 2 values per index)
         *  * r: `record` of memory cell. record = index * eta + value2 * eta_two + value1 * eta_three
         *
         *  When performing a read/write access, the values of i, t, v, v2, a, r are stored in the following wires +
         * selectors, depending on whether the gate is a RAM read/write or a ROM read
         *
         *  | gate type | i  | v2/t  |  v | a  | r  |
         *  | --------- | -- | ----- | -- | -- | -- |
         *  | ROM       | w1 | w2    | w3 | -- | w4 |
         *  | RAM       | w1 | w2    | w3 | qc | w4 |
         *
         * (for accesses where `index` is a circuit constant, it is assumed the circuit will apply a copy constraint on
         * `w2` to fix its value)
         *
         *
         */

        /**
         * Memory Record Check
         * Partial degree: 1
         * Total degree: 4
         *
         * A ROM/ROM access gate can be evaluated with the identity:
         *
         * qc + w1 \eta + w2 \eta_two + w3 \eta_three - w4 = 0
         *
         * For ROM gates, qc = 0
         */
        ap.memory_record_check = wire(p, D_WIRE.W_O) * rp.etaThree;
        ap.memory_record_check = ap.memory_record_check + (wire(p, D_WIRE.W_R) * rp.etaTwo);
        ap.memory_record_check = ap.memory_record_check + (wire(p, D_WIRE.W_L) * rp.eta);
        ap.memory_record_check = ap.memory_record_check + wire(p, D_WIRE.Q_C);
        ap.partial_record_check = ap.memory_record_check; // used in RAM consistency check; deg 1 or 4
        ap.memory_record_check = ap.memory_record_check - wire(p, D_WIRE.W_4);

        /**
         * Contribution 13 & 14
         * ROM Consistency Check
         * Partial degree: 1
         * Total degree: 4
         *
         * For every ROM read, a set equivalence check is applied between the record witnesses, and a second set of
         * records that are sorted.
         *
         * We apply the following checks for the sorted records:
         *
         * 1. w1, w2, w3 correctly map to 'index', 'v1, 'v2' for a given record value at w4
         * 2. index values for adjacent records are monotonically increasing
         * 3. if, at gate i, index_i == index_{i + 1}, then value1_i == value1_{i + 1} and value2_i == value2_{i + 1}
         *
         */
        ap.index_delta = wire(p, D_WIRE.W_L_SHIFT) - wire(p, D_WIRE.W_L);
        ap.record_delta = wire(p, D_WIRE.W_4_SHIFT) - wire(p, D_WIRE.W_4);

        ap.index_is_monotonically_increasing = ap.index_delta * ap.index_delta - ap.index_delta; // deg 2

        ap.adjacent_values_match_if_adjacent_indices_match = (ap.index_delta * D_MINUS_ONE + DFr.wrap(1)) * ap.record_delta; // deg 2

        evals[13] = ap.adjacent_values_match_if_adjacent_indices_match * (wire(p, D_WIRE.Q_L) * wire(p, D_WIRE.Q_R))
            * (wire(p, D_WIRE.Q_AUX) * domainSep); // deg 5
        evals[14] = ap.index_is_monotonically_increasing * (wire(p, D_WIRE.Q_L) * wire(p, D_WIRE.Q_R))
            * (wire(p, D_WIRE.Q_AUX) * domainSep); // deg 5

        ap.ROM_consistency_check_identity = ap.memory_record_check * (wire(p, D_WIRE.Q_L) * wire(p, D_WIRE.Q_R)); // deg 3 or 7

        /**
         * Contributions 15,16,17
         * RAM Consistency Check
         *
         * The 'access' type of the record is extracted with the expression `w_4 - ap.partial_record_check`
         * (i.e. for an honest Prover `w1 * eta + w2 * eta^2 + w3 * eta^3 - w4 = access`.
         * This is validated by requiring `access` to be boolean
         *
         * For two adjacent entries in the sorted list if _both_
         *  A) index values match
         *  B) adjacent access value is 0 (i.e. next gate is a READ)
         * then
         *  C) both values must match.
         * The gate boolean check is
         * (A && B) => C  === !(A && B) || C ===  !A || !B || C
         *
         * D_N.B. it is the responsibility of the circuit writer to ensure that every RAM cell is initialized
         * with a WRITE operation.
         */
        DFr access_type = (wire(p, D_WIRE.W_4) - ap.partial_record_check); // will be 0 or 1 for honest Prover; deg 1 or 4
        ap.access_check = access_type * access_type - access_type; // check value is 0 or 1; deg 2 or 8

        ap.next_gate_access_type = wire(p, D_WIRE.W_O_SHIFT) * rp.etaThree;
        ap.next_gate_access_type = ap.next_gate_access_type + (wire(p, D_WIRE.W_R_SHIFT) * rp.etaTwo);
        ap.next_gate_access_type = ap.next_gate_access_type + (wire(p, D_WIRE.W_L_SHIFT) * rp.eta);
        ap.next_gate_access_type = wire(p, D_WIRE.W_4_SHIFT) - ap.next_gate_access_type;

        DFr value_delta = wire(p, D_WIRE.W_O_SHIFT) - wire(p, D_WIRE.W_O);
        ap.adjacent_values_match_if_adjacent_indices_match_and_next_access_is_a_read_operation = (
            ap.index_delta * D_MINUS_ONE + DFr.wrap(1)
        ) * value_delta * (ap.next_gate_access_type * D_MINUS_ONE + DFr.wrap(1)); // deg 3 or 6

        // We can't apply the RAM consistency check identity on the final entry in the sorted list (the wires in the
        // next gate would make the identity fail).  We need to validate that its 'access type' bool is correct. Can't
        // do  with an arithmetic gate because of the  `eta` factors. We need to check that the *next* gate's access
        // type is  correct, to cover this edge case
        // deg 2 or 4
        ap.next_gate_access_type_is_boolean =
            ap.next_gate_access_type * ap.next_gate_access_type - ap.next_gate_access_type;

        // Putting it all together...
        evals[15] = ap.adjacent_values_match_if_adjacent_indices_match_and_next_access_is_a_read_operation
            * (wire(p, D_WIRE.Q_ARITH)) * (wire(p, D_WIRE.Q_AUX) * domainSep); // deg 5 or 8
        evals[16] = ap.index_is_monotonically_increasing * (wire(p, D_WIRE.Q_ARITH)) * (wire(p, D_WIRE.Q_AUX) * domainSep); // deg 4
        evals[17] = ap.next_gate_access_type_is_boolean * (wire(p, D_WIRE.Q_ARITH)) * (wire(p, D_WIRE.Q_AUX) * domainSep); // deg 4 or 6

        ap.RAM_consistency_check_identity = ap.access_check * (wire(p, D_WIRE.Q_ARITH)); // deg 3 or 9

        /**
         * RAM Timestamp Consistency Check
         *
         * | w1 | w2 | w3 | w4 |
         * | index | timestamp | timestamp_check | -- |
         *
         * Let delta_index = index_{i + 1} - index_{i}
         *
         * Iff delta_index == 0, timestamp_check = timestamp_{i + 1} - timestamp_i
         * Else timestamp_check = 0
         */
        ap.timestamp_delta = wire(p, D_WIRE.W_R_SHIFT) - wire(p, D_WIRE.W_R);
        ap.RAM_timestamp_check_identity =
            (ap.index_delta * D_MINUS_ONE + DFr.wrap(1)) * ap.timestamp_delta - wire(p, D_WIRE.W_O); // deg 3

        /**
         * Complete Contribution 12
         * The complete RAM/ROM memory identity
         * Partial degree:
         */
        ap.memory_identity = ap.ROM_consistency_check_identity; // deg 3 or 6
        ap.memory_identity =
            ap.memory_identity + ap.RAM_timestamp_check_identity * (wire(p, D_WIRE.Q_4) * wire(p, D_WIRE.Q_L)); // deg 4
        ap.memory_identity = ap.memory_identity + ap.memory_record_check * (wire(p, D_WIRE.Q_M) * wire(p, D_WIRE.Q_L)); // deg 3 or 6
        ap.memory_identity = ap.memory_identity + ap.RAM_consistency_check_identity; // deg 3 or 9

        // (deg 3 or 9) + (deg 4) + (deg 3)
        ap.auxiliary_identity = ap.memory_identity + non_native_field_identity + limb_accumulator_identity;
        ap.auxiliary_identity = ap.auxiliary_identity * (wire(p, D_WIRE.Q_AUX) * domainSep); // deg 4 or 10
        evals[12] = ap.auxiliary_identity;
    }

    struct PoseidonExternalParams {
        DFr s1;
        DFr s2;
        DFr s3;
        DFr s4;
        DFr u1;
        DFr u2;
        DFr u3;
        DFr u4;
        DFr t0;
        DFr t1;
        DFr t2;
        DFr t3;
        DFr v1;
        DFr v2;
        DFr v3;
        DFr v4;
        DFr q_pos_by_scaling;
    }

    function accumulatePoseidonExternalRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        PoseidonExternalParams memory ep;

        ep.s1 = wire(p, D_WIRE.W_L) + wire(p, D_WIRE.Q_L);
        ep.s2 = wire(p, D_WIRE.W_R) + wire(p, D_WIRE.Q_R);
        ep.s3 = wire(p, D_WIRE.W_O) + wire(p, D_WIRE.Q_O);
        ep.s4 = wire(p, D_WIRE.W_4) + wire(p, D_WIRE.Q_4);

        ep.u1 = ep.s1 * ep.s1 * ep.s1 * ep.s1 * ep.s1;
        ep.u2 = ep.s2 * ep.s2 * ep.s2 * ep.s2 * ep.s2;
        ep.u3 = ep.s3 * ep.s3 * ep.s3 * ep.s3 * ep.s3;
        ep.u4 = ep.s4 * ep.s4 * ep.s4 * ep.s4 * ep.s4;
        // matrix mul v = M_E * u with 14 additions
        ep.t0 = ep.u1 + ep.u2; // u_1 + u_2
        ep.t1 = ep.u3 + ep.u4; // u_3 + u_4
        ep.t2 = ep.u2 + ep.u2 + ep.t1; // 2u_2
        // ep.t2 += ep.t1; // 2u_2 + u_3 + u_4
        ep.t3 = ep.u4 + ep.u4 + ep.t0; // 2u_4
        // ep.t3 += ep.t0; // u_1 + u_2 + 2u_4
        ep.v4 = ep.t1 + ep.t1;
        ep.v4 = ep.v4 + ep.v4 + ep.t3;
        // ep.v4 += ep.t3; // u_1 + u_2 + 4u_3 + 6u_4
        ep.v2 = ep.t0 + ep.t0;
        ep.v2 = ep.v2 + ep.v2 + ep.t2;
        // ep.v2 += ep.t2; // 4u_1 + 6u_2 + u_3 + u_4
        ep.v1 = ep.t3 + ep.v2; // 5u_1 + 7u_2 + u_3 + 3u_4
        ep.v3 = ep.t2 + ep.v4; // u_1 + 3u_2 + 5u_3 + 7u_4

        ep.q_pos_by_scaling = wire(p, D_WIRE.Q_POSEIDON2_EXTERNAL) * domainSep;
        evals[18] = evals[18] + ep.q_pos_by_scaling * (ep.v1 - wire(p, D_WIRE.W_L_SHIFT));

        evals[19] = evals[19] + ep.q_pos_by_scaling * (ep.v2 - wire(p, D_WIRE.W_R_SHIFT));

        evals[20] = evals[20] + ep.q_pos_by_scaling * (ep.v3 - wire(p, D_WIRE.W_O_SHIFT));

        evals[21] = evals[21] + ep.q_pos_by_scaling * (ep.v4 - wire(p, D_WIRE.W_4_SHIFT));
    }

    struct PoseidonInternalParams {
        DFr u1;
        DFr u2;
        DFr u3;
        DFr u4;
        DFr u_sum;
        DFr v1;
        DFr v2;
        DFr v3;
        DFr v4;
        DFr s1;
        DFr q_pos_by_scaling;
    }

    function accumulatePoseidonInternalRelation(
        DFr[D_NUMBER_OF_ENTITIES] memory p,
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evals,
        DFr domainSep
    ) internal pure {
        PoseidonInternalParams memory ip;

        DFr[4] memory INTERNAL_MATRIX_DIAGONAL = [
            DFrLib.from(0x10dc6e9c006ea38b04b1e03b4bd9490c0d03f98929ca1d7fb56821fd19d3b6e7),
            DFrLib.from(0x0c28145b6a44df3e0149b3d0a30b3bb599df9756d4dd9b84a86b38cfb45a740b),
            DFrLib.from(0x00544b8338791518b2c7645a50392798b21f75bb60e3596170067d00141cac15),
            DFrLib.from(0x222c01175718386f2e2e82eb122789e352e105a3b8fa852613bc534433ee428b)
        ];

        // add round constants
        ip.s1 = wire(p, D_WIRE.W_L) + wire(p, D_WIRE.Q_L);

        // apply s-box round
        ip.u1 = ip.s1 * ip.s1 * ip.s1 * ip.s1 * ip.s1;
        ip.u2 = wire(p, D_WIRE.W_R);
        ip.u3 = wire(p, D_WIRE.W_O);
        ip.u4 = wire(p, D_WIRE.W_4);

        // matrix mul with v = M_I * u 4 muls and 7 additions
        ip.u_sum = ip.u1 + ip.u2 + ip.u3 + ip.u4;

        ip.q_pos_by_scaling = wire(p, D_WIRE.Q_POSEIDON2_INTERNAL) * domainSep;

        ip.v1 = ip.u1 * INTERNAL_MATRIX_DIAGONAL[0] + ip.u_sum;
        evals[22] = evals[22] + ip.q_pos_by_scaling * (ip.v1 - wire(p, D_WIRE.W_L_SHIFT));

        ip.v2 = ip.u2 * INTERNAL_MATRIX_DIAGONAL[1] + ip.u_sum;
        evals[23] = evals[23] + ip.q_pos_by_scaling * (ip.v2 - wire(p, D_WIRE.W_R_SHIFT));

        ip.v3 = ip.u3 * INTERNAL_MATRIX_DIAGONAL[2] + ip.u_sum;
        evals[24] = evals[24] + ip.q_pos_by_scaling * (ip.v3 - wire(p, D_WIRE.W_O_SHIFT));

        ip.v4 = ip.u4 * INTERNAL_MATRIX_DIAGONAL[3] + ip.u_sum;
        evals[25] = evals[25] + ip.q_pos_by_scaling * (ip.v4 - wire(p, D_WIRE.W_4_SHIFT));
    }

    function scaleAndBatchSubrelations(
        DFr[D_NUMBER_OF_SUBRELATIONS] memory evaluations,
        DFr[D_NUMBER_OF_ALPHAS] memory subrelationChallenges
    ) internal pure returns (DFr accumulator) {
        accumulator = accumulator + evaluations[0];

        for (uint256 i = 1; i < D_NUMBER_OF_SUBRELATIONS; ++i) {
            accumulator = accumulator + evaluations[i] * subrelationChallenges[i - 1];
        }
    }
}

struct DShpleminiIntermediates {
    DFr unshiftedScalar;
    DFr shiftedScalar;
    // Scalar to be multiplied by [1]₁
    DFr constantTermAccumulator;
    // Accumulator for powers of rho
    DFr batchingChallenge;
    // Linear combination of multilinear (sumcheck) evaluations and powers of rho
    DFr batchedEvaluation;
    // 1/(z - r^{2^i}) for i = 0, ..., logSize, dynamically updated
    DFr posInvertedDenominator;
    // 1/(z + r^{2^i}) for i = 0, ..., logSize, dynamically updated
    DFr negInvertedDenominator;
    // v^{2i} * 1/(z - r^{2^i})
    DFr scalingFactorPos;
    // v^{2i+1} * 1/(z + r^{2^i})
    DFr scalingFactorNeg;
    // // Fold_i(r^{2^i}) reconstructed by Verifier
    // DFr[D_CONST_PROOF_SIZE_LOG_N] foldPosEvaluations;
}

library DCommitmentSchemeLib {
    using DFrLib for DFr;

    function computeSquares(DFr r) internal pure returns (DFr[D_CONST_PROOF_SIZE_LOG_N] memory squares) {
        squares[0] = r;
        for (uint256 i = 1; i < D_CONST_PROOF_SIZE_LOG_N; ++i) {
            squares[i] = squares[i - 1].sqr();
        }
    }

    // Compute the evaluations  A_l(r^{2^l}) for l = 0, ..., m-1
    function computeFoldPosEvaluations(
        DFr[D_CONST_PROOF_SIZE_LOG_N] memory sumcheckUChallenges,
        DFr batchedEvalAccumulator,
        DFr[D_CONST_PROOF_SIZE_LOG_N] memory geminiEvaluations,
        DFr[D_CONST_PROOF_SIZE_LOG_N] memory geminiEvalChallengePowers,
        uint256 logSize
    ) internal view returns (DFr[D_CONST_PROOF_SIZE_LOG_N] memory foldPosEvaluations) {
        for (uint256 i = D_CONST_PROOF_SIZE_LOG_N; i > 0; --i) {
            DFr challengePower = geminiEvalChallengePowers[i - 1];
            DFr u = sumcheckUChallenges[i - 1];

            DFr batchedEvalRoundAcc = (
                (challengePower * batchedEvalAccumulator * DFr.wrap(2))
                    - geminiEvaluations[i - 1] * (challengePower * (DFr.wrap(1) - u) - u)
            );
            // Divide by the denominator
            batchedEvalRoundAcc = batchedEvalRoundAcc * (challengePower * (DFr.wrap(1) - u) + u).invert();

            if (i <= logSize) {
                batchedEvalAccumulator = batchedEvalRoundAcc;
                foldPosEvaluations[i - 1] = batchedEvalRoundAcc;
            }
        }

    }
}

interface IDisclosureHonkVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}


abstract contract DisclosureBaseHonkVerifier is IDisclosureHonkVerifier {
    using DFrLib for DFr;

    uint256 immutable n;
    uint256 immutable logN;
    uint256 immutable numPublicInputs;

    constructor(uint256 _n, uint256 _logN, uint256 _numPublicInputs) {
        n = _n;
        logN = _logN;
        numPublicInputs = _numPublicInputs;
    }

    error ProofLengthWrong();
    error PublicInputsLengthWrong();
    error SumcheckFailed();
    error ShpleminiFailed();

    // Number of field elements in a ultra honk zero knowledge proof
    uint256 constant PROOF_SIZE = 456;

    function loadVerificationKey() internal pure virtual returns (DisclosureHonk.VerificationKey memory);

    function verify(bytes calldata proof, bytes32[] calldata publicInputs) public view override returns (bool) {
         // Check the received proof is the expected size where each field element is 32 bytes
        if (proof.length != PROOF_SIZE * 32) {
            revert ProofLengthWrong();
        }

        DisclosureHonk.VerificationKey memory vk = loadVerificationKey();
        DisclosureHonk.Proof memory p = DTranscriptLib.loadProof(proof);

        if (publicInputs.length != vk.publicInputsSize - D_PAIRING_POINTS_SIZE) {
            revert PublicInputsLengthWrong();
        }

        // Generate the fiat shamir challenges for the whole protocol
        // TODO(https://github.com/AztecProtocol/barretenberg/issues/1281): Add pubInputsOffset to VK or remove entirely.
        DTranscript memory t = DTranscriptLib.generateTranscript(p, publicInputs, vk.circuitSize, vk.publicInputsSize, /*pubInputsOffset=*/1);

        // Derive public input delta
        // TODO(https://github.com/AztecProtocol/barretenberg/issues/1281): Add pubInputsOffset to VK or remove entirely.
        t.relationParameters.publicInputsDelta = computePublicInputDelta(
            publicInputs, p.pairingPointObject, t.relationParameters.beta, t.relationParameters.gamma, /*pubInputsOffset=*/1
        );

        // Sumcheck
        bool sumcheckVerified = verifySumcheck(p, t);
        if (!sumcheckVerified) revert SumcheckFailed();

        bool shpleminiVerified = verifyShplemini(p, vk, t);
        if (!shpleminiVerified) revert ShpleminiFailed();

        return sumcheckVerified && shpleminiVerified; // Boolean condition not required - nice for vanity :)
    }

    function computePublicInputDelta(bytes32[] memory publicInputs, DFr[D_PAIRING_POINTS_SIZE] memory pairingPointObject, DFr beta, DFr gamma, uint256 offset)
        internal
        view
        returns (DFr publicInputDelta)
    {
        DFr numerator = DFr.wrap(1);
        DFr denominator = DFr.wrap(1);

        DFr numeratorAcc = gamma + (beta * DFrLib.from(n + offset));
        DFr denominatorAcc = gamma - (beta * DFrLib.from(offset + 1));

        {
            for (uint256 i = 0; i < numPublicInputs - D_PAIRING_POINTS_SIZE; i++) {
                DFr pubInput = DFrLib.fromBytes32(publicInputs[i]);

                numerator = numerator * (numeratorAcc + pubInput);
                denominator = denominator * (denominatorAcc + pubInput);

                numeratorAcc = numeratorAcc + beta;
                denominatorAcc = denominatorAcc - beta;
            }

            for (uint256 i = 0; i < D_PAIRING_POINTS_SIZE; i++) {
                DFr pubInput = pairingPointObject[i];

                numerator = numerator * (numeratorAcc + pubInput);
                denominator = denominator * (denominatorAcc + pubInput);

                numeratorAcc = numeratorAcc + beta;
                denominatorAcc = denominatorAcc - beta;
            }
        }

        // DFr delta = numerator / denominator; // TOOO: batch invert later?
        publicInputDelta = DFrLib.div(numerator, denominator);
    }

    function verifySumcheck(DisclosureHonk.Proof memory proof, DTranscript memory tp) internal view returns (bool verified) {
        DFr roundTarget;
        DFr powPartialEvaluation = DFr.wrap(1);

        // We perform sumcheck reductions over log n rounds ( the multivariate degree )
        for (uint256 round; round < logN; ++round) {
            DFr[D_BATCHED_RELATION_PARTIAL_LENGTH] memory roundUnivariate = proof.sumcheckUnivariates[round];
            bool valid = checkSum(roundUnivariate, roundTarget);
            if (!valid) revert SumcheckFailed();

            DFr roundChallenge = tp.sumCheckUChallenges[round];

            // Update the round target for the next rounf
            roundTarget = computeNextTargetSum(roundUnivariate, roundChallenge);
            powPartialEvaluation = partiallyEvaluatePOW(tp.gateChallenges[round], powPartialEvaluation, roundChallenge);
        }

        // Last round
        DFr grandHonkRelationSum =
            DRelationsLib.accumulateRelationEvaluations(proof.sumcheckEvaluations, tp.relationParameters, tp.alphas, powPartialEvaluation);
        verified = (grandHonkRelationSum == roundTarget);
    }

    function checkSum(DFr[D_BATCHED_RELATION_PARTIAL_LENGTH] memory roundUnivariate, DFr roundTarget)
        internal
        pure
        returns (bool checked)
    {
        DFr totalSum = roundUnivariate[0] + roundUnivariate[1];
        checked = totalSum == roundTarget;
    }

    // Return the new target sum for the next sumcheck round
    function computeNextTargetSum(DFr[D_BATCHED_RELATION_PARTIAL_LENGTH] memory roundUnivariates, DFr roundChallenge)
        internal
        view
        returns (DFr targetSum)
    {
        // TODO: inline
        DFr[D_BATCHED_RELATION_PARTIAL_LENGTH] memory BARYCENTRIC_LAGRANGE_DENOMINATORS = [
            DFr.wrap(0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593efffec51),
            DFr.wrap(0x00000000000000000000000000000000000000000000000000000000000002d0),
            DFr.wrap(0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593efffff11),
            DFr.wrap(0x0000000000000000000000000000000000000000000000000000000000000090),
            DFr.wrap(0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593efffff71),
            DFr.wrap(0x00000000000000000000000000000000000000000000000000000000000000f0),
            DFr.wrap(0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593effffd31),
            DFr.wrap(0x00000000000000000000000000000000000000000000000000000000000013b0)
        ];

        // To compute the next target sum, we evaluate the given univariate at a point u (challenge).

        // Performing Barycentric evaluations
        // Compute B(x)
        DFr numeratorValue = DFr.wrap(1);
        for (uint256 i = 0; i < D_BATCHED_RELATION_PARTIAL_LENGTH; ++i) {
            numeratorValue = numeratorValue * (roundChallenge - DFr.wrap(i));
        }

        // Calculate domain size D_N of inverses
        DFr[D_BATCHED_RELATION_PARTIAL_LENGTH] memory denominatorInverses;
        for (uint256 i = 0; i < D_BATCHED_RELATION_PARTIAL_LENGTH; ++i) {
            DFr inv = BARYCENTRIC_LAGRANGE_DENOMINATORS[i];
            inv = inv * (roundChallenge - DFr.wrap(i));
            inv = DFrLib.invert(inv);
            denominatorInverses[i] = inv;
        }

        for (uint256 i = 0; i < D_BATCHED_RELATION_PARTIAL_LENGTH; ++i) {
            DFr term = roundUnivariates[i];
            term = term * denominatorInverses[i];
            targetSum = targetSum + term;
        }

        // Scale the sum by the value of B(x)
        targetSum = targetSum * numeratorValue;
    }

    // Univariate evaluation of the monomial ((1-X_l) + X_l.B_l) at the challenge point X_l=u_l
    function partiallyEvaluatePOW(DFr gateChallenge, DFr currentEvaluation, DFr roundChallenge)
        internal
        pure
        returns (DFr newEvaluation)
    {
        DFr univariateEval = DFr.wrap(1) + (roundChallenge * (gateChallenge - DFr.wrap(1)));
        newEvaluation = currentEvaluation * univariateEval;
    }

    function verifyShplemini(DisclosureHonk.Proof memory proof, DisclosureHonk.VerificationKey memory vk, DTranscript memory tp)
        internal
        view
        returns (bool verified)
    {
        DShpleminiIntermediates memory mem; // stack

        // - Compute vector (r, r², ... , r²⁽ⁿ⁻¹⁾), where n = log_circuit_size
        DFr[D_CONST_PROOF_SIZE_LOG_N] memory powers_of_evaluation_challenge = DCommitmentSchemeLib.computeSquares(tp.geminiR);

        // Arrays hold values that will be linearly combined for the gemini and shplonk batch openings
        DFr[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 2] memory scalars;
        DisclosureHonk.G1Point[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 2] memory commitments;

        mem.posInvertedDenominator = (tp.shplonkZ - powers_of_evaluation_challenge[0]).invert();
        mem.negInvertedDenominator = (tp.shplonkZ + powers_of_evaluation_challenge[0]).invert();

        mem.unshiftedScalar = mem.posInvertedDenominator + (tp.shplonkNu * mem.negInvertedDenominator);
        mem.shiftedScalar =
            tp.geminiR.invert() * (mem.posInvertedDenominator - (tp.shplonkNu * mem.negInvertedDenominator));

        scalars[0] = DFr.wrap(1);
        commitments[0] = convertProofPoint(proof.shplonkQ);

        mem.batchingChallenge = DFr.wrap(1);
        mem.batchedEvaluation = DFr.wrap(0);

        for (uint256 i = 1; i <= D_NUMBER_UNSHIFTED; ++i) {
            scalars[i] = mem.unshiftedScalar.neg() * mem.batchingChallenge;
            mem.batchedEvaluation = mem.batchedEvaluation + (proof.sumcheckEvaluations[i - 1] * mem.batchingChallenge);
            mem.batchingChallenge = mem.batchingChallenge * tp.rho;
        }
        // g commitments are accumulated at r
        for (uint256 i = D_NUMBER_UNSHIFTED + 1; i <= D_NUMBER_OF_ENTITIES; ++i) {
            scalars[i] = mem.shiftedScalar.neg() * mem.batchingChallenge;
            mem.batchedEvaluation = mem.batchedEvaluation + (proof.sumcheckEvaluations[i - 1] * mem.batchingChallenge);
            mem.batchingChallenge = mem.batchingChallenge * tp.rho;
        }

        commitments[1] = vk.qm;
        commitments[2] = vk.qc;
        commitments[3] = vk.ql;
        commitments[4] = vk.qr;
        commitments[5] = vk.qo;
        commitments[6] = vk.q4;
        commitments[7] = vk.qLookup;
        commitments[8] = vk.qArith;
        commitments[9] = vk.qDeltaRange;
        commitments[10] = vk.qElliptic;
        commitments[11] = vk.qAux;
        commitments[12] = vk.qPoseidon2External;
        commitments[13] = vk.qPoseidon2Internal;
        commitments[14] = vk.s1;
        commitments[15] = vk.s2;
        commitments[16] = vk.s3;
        commitments[17] = vk.s4;
        commitments[18] = vk.id1;
        commitments[19] = vk.id2;
        commitments[20] = vk.id3;
        commitments[21] = vk.id4;
        commitments[22] = vk.t1;
        commitments[23] = vk.t2;
        commitments[24] = vk.t3;
        commitments[25] = vk.t4;
        commitments[26] = vk.lagrangeFirst;
        commitments[27] = vk.lagrangeLast;

        // Accumulate proof points
        commitments[28] = convertProofPoint(proof.w1);
        commitments[29] = convertProofPoint(proof.w2);
        commitments[30] = convertProofPoint(proof.w3);
        commitments[31] = convertProofPoint(proof.w4);
        commitments[32] = convertProofPoint(proof.zPerm);
        commitments[33] = convertProofPoint(proof.lookupInverses);
        commitments[34] = convertProofPoint(proof.lookupReadCounts);
        commitments[35] = convertProofPoint(proof.lookupReadTags);

        // to be Shifted
        commitments[36] = convertProofPoint(proof.w1);
        commitments[37] = convertProofPoint(proof.w2);
        commitments[38] = convertProofPoint(proof.w3);
        commitments[39] = convertProofPoint(proof.w4);
        commitments[40] = convertProofPoint(proof.zPerm);

        // Add contributions from A₀(r) and A₀(-r) to constant_term_accumulator:
        // Compute the evaluations A_l(r^{2^l}) for l = 0, ..., logN - 1
        DFr[D_CONST_PROOF_SIZE_LOG_N] memory foldPosEvaluations = DCommitmentSchemeLib.computeFoldPosEvaluations(
            tp.sumCheckUChallenges,
            mem.batchedEvaluation,
            proof.geminiAEvaluations,
            powers_of_evaluation_challenge,
            logN
        );

        // Compute the Shplonk constant term contributions from A₀(±r)
        mem.constantTermAccumulator = foldPosEvaluations[0] * mem.posInvertedDenominator;
        mem.constantTermAccumulator =
            mem.constantTermAccumulator + (proof.geminiAEvaluations[0] * tp.shplonkNu * mem.negInvertedDenominator);
        mem.batchingChallenge = tp.shplonkNu.sqr();

        // Compute Shplonk constant term contributions from Aₗ(±r^{2ˡ}) for l = 1, ..., m-1;
        // Compute scalar multipliers for each fold commitment
        for (uint256 i = 0; i < D_CONST_PROOF_SIZE_LOG_N - 1; ++i) {
            bool dummy_round = i >= (logN - 1);

            if (!dummy_round) {
                // Update inverted denominators
                mem.posInvertedDenominator = (tp.shplonkZ - powers_of_evaluation_challenge[i + 1]).invert();
                mem.negInvertedDenominator = (tp.shplonkZ + powers_of_evaluation_challenge[i + 1]).invert();

                // Compute the scalar multipliers for Aₗ(± r^{2ˡ}) and [Aₗ]
                mem.scalingFactorPos = mem.batchingChallenge * mem.posInvertedDenominator;
                mem.scalingFactorNeg = mem.batchingChallenge * tp.shplonkNu * mem.negInvertedDenominator;
                // [Aₗ] is multiplied by -v^{2l}/(z-r^{2^l}) - v^{2l+1} /(z+ r^{2^l})
                scalars[D_NUMBER_OF_ENTITIES + 1 + i] = mem.scalingFactorNeg.neg() + mem.scalingFactorPos.neg();

                // Accumulate the const term contribution given by
                // v^{2l} * Aₗ(r^{2ˡ}) /(z-r^{2^l}) + v^{2l+1} * Aₗ(-r^{2ˡ}) /(z+ r^{2^l})
                DFr accumContribution = mem.scalingFactorNeg * proof.geminiAEvaluations[i + 1];
                accumContribution = accumContribution + mem.scalingFactorPos * foldPosEvaluations[i + 1];
                mem.constantTermAccumulator = mem.constantTermAccumulator + accumContribution;
                // Update the running power of v
                mem.batchingChallenge = mem.batchingChallenge * tp.shplonkNu * tp.shplonkNu;
            }

            commitments[D_NUMBER_OF_ENTITIES + 1 + i] = convertProofPoint(proof.geminiFoldComms[i]);
        }

        // Finalise the batch opening claim
        commitments[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N] = DisclosureHonk.G1Point({x: 1, y: 2});
        scalars[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N] = mem.constantTermAccumulator;

        DisclosureHonk.G1Point memory quotient_commitment = convertProofPoint(proof.kzgQuotient);

        commitments[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 1] = quotient_commitment;
        scalars[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 1] = tp.shplonkZ; // evaluation challenge

        DisclosureHonk.G1Point memory P_0 = batchMul(commitments, scalars);
        DisclosureHonk.G1Point memory P_1 = negateInplace(quotient_commitment);

        return pairing(P_0, P_1);
    }

    // This implementation is the same as above with different constants
    function batchMul(
        DisclosureHonk.G1Point[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 2] memory base,
        DFr[D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 2] memory scalars
    ) internal view returns (DisclosureHonk.G1Point memory result) {
        uint256 limit = D_NUMBER_OF_ENTITIES + D_CONST_PROOF_SIZE_LOG_N + 2;
        assembly {
            let success := 0x01
            let free := mload(0x40)

            // Write the original into the accumulator
            // Load into memory for ecMUL, leave offset for eccAdd result
            // base is an array of pointers, so we have to dereference them
            mstore(add(free, 0x40), mload(mload(base)))
            mstore(add(free, 0x60), mload(add(0x20, mload(base))))
            // Add scalar
            mstore(add(free, 0x80), mload(scalars))
            success := and(success, staticcall(gas(), 7, add(free, 0x40), 0x60, free, 0x40))

            let count := 0x01
            for {} lt(count, limit) { count := add(count, 1) } {
                // Get loop offsets
                let base_base := add(base, mul(count, 0x20))
                let scalar_base := add(scalars, mul(count, 0x20))

                mstore(add(free, 0x40), mload(mload(base_base)))
                mstore(add(free, 0x60), mload(add(0x20, mload(base_base))))
                // Add scalar
                mstore(add(free, 0x80), mload(scalar_base))

                success := and(success, staticcall(gas(), 7, add(free, 0x40), 0x60, add(free, 0x40), 0x40))
                // accumulator = accumulator + accumulator_2
                success := and(success, staticcall(gas(), 6, free, 0x80, free, 0x40))
            }

            // Return the result - i hate this
            mstore(result, mload(free))
            mstore(add(result, 0x20), mload(add(free, 0x20)))
        }
    }
}

contract DisclosureHonkVerifier is DisclosureBaseHonkVerifier(D_N, D_LOG_N, D_NUMBER_OF_PUBLIC_INPUTS) {
     function loadVerificationKey() internal pure override returns (DisclosureHonk.VerificationKey memory) {
       return DisclosureVerificationKey.loadVerificationKey();
    }
}
