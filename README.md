# ZK Proof-of-Existence System

A production-ready zero-knowledge proof system for timestamping documents on Arbitrum with selective disclosure capabilities. Built with Noir, UltraHonk proofs, and React.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Noir](https://img.shields.io/badge/Noir-1.0.0--beta.11-purple)](https://noir-lang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.21-363636)](https://soliditylang.org/)
[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-blue)](https://arbitrum.io/)

---

## Table of Contents

1. [Overview](#overview)
2. [Why This Tool?](#why-this-tool)
3. [Zero-Knowledge Proofs Explained](#zero-knowledge-proofs-explained)
4. [Cryptographic Primitives](#cryptographic-primitives)
   - [BN254 Elliptic Curve](#bn254-elliptic-curve)
   - [Pedersen Commitments](#pedersen-commitments)
   - [UltraHonk Proving System](#ultrahonk-proving-system)
5. [System Architecture](#system-architecture)
6. [Circuit Design](#circuit-design)
7. [Smart Contract Architecture](#smart-contract-architecture)
8. [Frontend Implementation](#frontend-implementation)
9. [Getting Started](#getting-started)
10. [Advanced Usage](#advanced-usage)
11. [Mathematical Foundations](#mathematical-foundations)
12. [Security Considerations](#security-considerations)

---

## Overview

The ZK Proof-of-Existence System allows users to **prove a document existed at a specific time** without revealing its contents. It leverages zero-knowledge proofs to provide:

- **Privacy-preserving timestamping**: Hash your document locally, prove knowledge of the preimage on-chain
- **Selective disclosure**: Reveal metadata (email domain, file size range, file type) without exposing the full document
- **Verifiable proofs**: Anyone can verify a document's existence timestamp without trusting the prover
- **Non-repudiable records**: On-chain commitments are permanent and tamper-proof

**Key Innovation**: Uses **UltraHonk** proofs with **Keccak hashing** for EVM verification, eliminating the trusted setup required by older SNARK systems.

---

## Why This Tool?

### The Problem

Traditional timestamping services require:
1. **Trust**: You must trust the service won't leak your document
2. **Privacy loss**: You upload your document to a third party
3. **No selective disclosure**: You can't prove properties (e.g., "this document is a PDF from @mit.edu") without revealing the entire document

### The Solution

Our system provides:
1. **Zero-knowledge**: The document never leaves your browser—only a cryptographic commitment is submitted on-chain
2. **Selective disclosure**: Prove specific properties (email domain, file size, file type) via ZK circuits without revealing the full document
3. **Trustless verification**: Anyone can verify proofs on-chain; no trusted third party required
4. **Cryptographic binding**: The Pedersen commitment cryptographically binds the document to its metadata

### Use Cases

- **Legal timestamping**: Prove a contract existed before a certain date without revealing terms
- **IP protection**: Timestamp research documents or code without public disclosure
- **Compliance**: Prove document properties (author email domain, file type) for audits
- **Academic integrity**: Timestamp papers/theses with author email verification
- **Whistleblowing**: Prove possession of documents at a specific time without exposing sources

---

## Zero-Knowledge Proofs Explained

### What is a Zero-Knowledge Proof?

A **zero-knowledge proof (ZKP)** is a cryptographic protocol where a **prover** convinces a **verifier** that a statement is true **without revealing any information beyond the truth of the statement**.

**Formal Definition**: For a language $L$ and instance $x$, a ZKP proves $x \in L$ with three properties:

1. **Completeness**: If $x \in L$, an honest prover convinces an honest verifier with overwhelming probability
2. **Soundness**: If $x \notin L$, no cheating prover can convince the verifier (except with negligible probability)
3. **Zero-knowledge**: The verifier learns nothing beyond the fact that $x \in L$

### SNARKs vs STARKs

Our system uses **SNARKs** (Succinct Non-interactive Arguments of Knowledge):

| Property | SNARKs (this project) | STARKs |
|---|---|---|
| **Proof size** | ~1-2 KB (constant) | 10-100 KB (logarithmic) |
| **Verification time** | ~50-200ms on EVM | ~1-5s |
| **Prover time** | Moderate (30-60s in-browser) | Slower |
| **Trusted setup** | **None** (UltraHonk uses transparent setup) | None |
| **Quantum resistance** | ❌ Relies on discrete log | ✅ Hash-based |
| **Best for** | EVM verification, low gas | Large computations, post-quantum |

**Why SNARKs?** Ethereum gas costs favor small proofs. A 1.5 KB SNARK proof costs ~200-400k gas to verify, while a 50 KB STARK would exceed block limits.

---

## Cryptographic Primitives

### BN254 Elliptic Curve

**BN254** (also called **BN128** or **alt_bn128**) is a **Barreto-Naehrig pairing-friendly elliptic curve** optimized for zkSNARKs.

#### Curve Equation

$$y^2 = x^3 + 3 \pmod{p}$$

where $p = 21888242871839275222246405745257275088696311157297823662689037894645226208583$ (a 254-bit prime).

#### Why BN254?

1. **EVM precompiles**: Ethereum has native support (precompiles at `0x06-0x09`) for BN254 operations:
   - `ecAdd` (addition): 150 gas
   - `ecMul` (scalar mult): 6000 gas
   - `ecPairing` (pairing check): 45k + 34k × pairs gas
   
2. **Efficient pairings**: BN254 enables **bilinear pairings** $e: \mathbb{G}_1 \times \mathbb{G}_2 \to \mathbb{G}_T$ where:
   - $e(aP, bQ) = e(P, Q)^{ab}$ (bilinearity)
   - Used in proof verification for checking polynomial commitments

3. **128-bit security**: Provides ~100-110 bits of security against best-known attacks (rho method, Pollard's rho for discrete log)

#### Field Structure

- **Base field** $\mathbb{F}_p$: 254-bit integers mod $p$
- **Scalar field** $\mathbb{F}_r$: Order $r = 21888242871839275222246405745257275088548364400416034343698204186575808495617$
- **Embedding degree**: $k = 12$ (enables efficient pairings)

#### Point Representation

Points are represented as:
- **Affine**: $(x, y)$ satisfying $y^2 = x^3 + 3$
- **Jacobian**: $(X, Y, Z)$ where $x = X/Z^2, y = Y/Z^3$ (faster arithmetic)

**Generator points**:
- $G_1$: $(1, 2)$ on the base curve
- $G_2$: More complex point on the twist $\mathbb{E}'(\mathbb{F}_{p^2})$

---

### Pedersen Commitments

A **Pedersen commitment** is a **cryptographic commitment scheme** that allows you to commit to a value without revealing it, while preserving the ability to prove properties about the committed value.

#### Mathematical Construction

Given:
- A group $\mathbb{G}$ of prime order $q$ (e.g., BN254 elliptic curve)
- Two random generators $G, H \in \mathbb{G}$ where the discrete log $\log_G H$ is unknown

**Commit to message** $m$ with randomness (salt) $r$:

$$C = \text{Commit}(m, r) = mG + rH$$

In our system, for a document hash $h$ and salt $s$:

$$C = h \cdot G + s \cdot H$$

computed via the Noir `std::hash::pedersen_hash` function.

#### Properties

1. **Hiding**: Given $C$, an adversary cannot determine $m$ (information-theoretically secure if $r$ is uniform random)

2. **Binding**: Cannot find $m, r$ and $m', r'$ such that $C = mG + rH = m'G + r'H$ unless $m = m'$ and $r = r'$ (computationally secure under discrete log assumption)

3. **Homomorphic**: 
   $$\text{Commit}(m_1, r_1) + \text{Commit}(m_2, r_2) = \text{Commit}(m_1 + m_2, r_1 + r_2)$$

#### Why Pedersen for This System?

1. **ZK-friendly**: Efficiently provable in arithmetic circuits (Noir circuits)
2. **Collision-resistant**: Infeasible to find two different $(m, r)$ pairs with the same commitment
3. **Deterministic verification**: Anyone can recompute $C$ given $(m, r)$ to verify the commitment
4. **Privacy**: The salt $r$ acts as a secret key—without it, the commitment reveals nothing about $m$

#### Implementation in Noir

```rust
use std::hash::pedersen_hash;

fn compute_commitment(document_hash: Field, salt: Field) -> Field {
    pedersen_hash([document_hash, salt])
}
```

Noir's `pedersen_hash` uses the **Pedersen hash function** optimized for BN254, which internally computes:

$$H(m_1, m_2, \ldots, m_n) = m_1 G_1 + m_2 G_2 + \cdots + m_n G_n$$

where $G_i$ are independent random generators derived from a public seed.

---

### UltraHonk Proving System

**UltraHonk** is Aztec's next-generation proving system, an evolution of **UltraPlonk** that removes the need for a trusted setup.

#### Key Features

1. **Transparent setup**: No trusted ceremony required (unlike Groth16)
2. **Universal**: Single setup works for all circuits (unlike Groth16's circuit-specific setup)
3. **Efficient verification**: ~200-400k gas on EVM for typical proofs
4. **Keccak compatibility**: Uses Keccak256 for Fiat-Shamir (EVM-native), avoiding expensive Poseidon computations in Solidity

#### Proof Components

A UltraHonk proof consists of:
1. **Polynomial commitments**: KZG commitments to witness polynomials
2. **Opening proofs**: Proofs that polynomials evaluate to claimed values
3. **Fiat-Shamir challenges**: Random challenges derived from transcript (Keccak256 hashes)

**Proof structure**:
```
proof = (
    [π_comm],       // Polynomial commitments (KZG on BN254)
    [π_open],       // Opening proofs
    [π_grand_sum],  // Grand sum check contributions
    public_inputs   // Public circuit inputs
)
```

#### Verification Algorithm (Simplified)

1. **Parse proof**: Extract commitments, opening proofs, challenges
2. **Recompute challenges**: Run Fiat-Shamir to derive $\alpha, \beta, \gamma, \ldots$ from transcript
3. **Pairing check**: Verify the KZG opening proof:
   $$e(\pi_{\text{comm}}, [x]_2) = e(\pi_{\text{open}}, [1]_2) \cdot e([y]_1, [1]_2)$$
   where $\pi_{\text{comm}}$ is the commitment, $\pi_{\text{open}}$ is the opening proof, $x$ is the evaluation point, and $y$ is the claimed value

4. **Verify constraints**: Check that the proof satisfies the circuit's arithmetic constraints

**EVM gas breakdown** (typical):
- Fiat-Shamir (Keccak): 3k-10k gas
- Pairing checks: 180k-300k gas
- Arithmetic: 10k-50k gas
- **Total**: ~200-400k gas

---

## System Architecture

### High-Level Flow

```
┌─────────────────┐
│  User Browser   │
│                 │
│  1. Upload doc  │───────────┐
│  2. Hash (SHA)  │           │
│  3. Generate ZK │           │ WASM (Noir + BB.js)
│     proof       │<──────────┘
└────────┬────────┘
         │ proof + commitment
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Smart Contract │◄─────┤ Arbitrum Sepolia │
│  (Solidity)     │      │   Blockchain     │
│                 │      └──────────────────┘
│  • Verify proof │
│  • Store commit │
│  • Emit event   │
└─────────────────┘
         │
         │ commitment hash
         │
         ▼
┌─────────────────┐
│  Public Ledger  │
│                 │
│  Anyone can     │
│  verify:        │
│  • Existence    │
│  • Timestamp    │
│  • Disclosures  │
└─────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Circuits** | Noir 1.0.0-beta.11 | ZK circuit DSL |
| **Proving** | Barretenberg 0.87.2 (UltraHonk) | Proof generation |
| **Contracts** | Solidity 0.8.21, Foundry | On-chain verification |
| **Blockchain** | Arbitrum Sepolia | Low-cost L2 deployment |
| **Frontend** | React 19, Vite 7 | Browser-based prover |
| **Crypto libs** | @aztec/bb.js (WASM) | In-browser proof generation |
| **Auth** | Privy | Embedded wallet (Google OAuth) |

---

## Circuit Design

### 1. Commitment Helper Circuit

**Purpose**: Pure function to compute Pedersen commitment (used as a subroutine).

**Inputs**:
```rust
fn main(document_hash: Field, salt: Field) -> Field
```

**Output**: 
$$C = \text{PedersenHash}([\text{document\_hash}, \text{salt}])$$

**Constraints**: 1 Pedersen hash (≈ 512 constraints on BN254)

**Usage**: Called by other circuits to ensure consistent commitment computation.

---

### 2. Basic Timestamp Circuit

**Purpose**: Prove knowledge of a document's preimage (hash + salt) and validate timestamp.

**Inputs**:
```rust
fn main(
    document_hash: Field,       // Private: SHA-256 of document (truncated to 31 bytes)
    salt: Field,                // Private: Random 31-byte salt
    commitment: pub Field,      // Public: Pedersen commitment
    current_timestamp: pub u64  // Public: Unix timestamp (seconds)
)
```

**Constraints**:
1. **Commitment check**: 
   $$C = \text{PedersenHash}([\text{document\_hash}, \text{salt}])$$
   Ensures the prover knows the preimage of the commitment.

2. **Timestamp validation**: 
   $$\text{current\_timestamp} > 0$$
   Prevents zero/invalid timestamps.

**Circuit depth**: ~2,000 constraints

**Proof generation time**: ~30s in-browser (WASM), ~5s native

---

### 3. Selective Disclosure Circuit

**Purpose**: Prove properties of a document (email domain, file size, file type) without revealing the document or its full metadata.

**Inputs**:
```rust
fn main(
    // Private witnesses
    document_hash: Field,
    salt: Field,
    author_email: [u8; 100],     // e.g., "alice@mit.edu\0\0..."
    file_size: u64,              // Exact file size in bytes
    file_type: [u8; 20],         // e.g., "pdf\0\0..."
    
    // Public inputs (verified on-chain)
    commitment: pub Field,
    reveal_email_domain: pub bool,
    reveal_size_range: pub bool,
    reveal_file_type: pub bool,
    claimed_domain_hash: pub Field,     // Pedersen hash of domain
    claimed_size_min: pub u64,
    claimed_size_max: pub u64,
    claimed_file_type: pub [u8; 20]
)
```

**Constraints**:

1. **Commitment verification** (always checked):
   $$C = \text{PedersenHash}([\text{document\_hash}, \text{salt}])$$

2. **Email domain disclosure** (if `reveal_email_domain = true`):
   - Extract domain from `author_email` (substring after `@`)
   - Compute domain hash: $H_{\text{domain}} = \text{PedersenHash}(\text{domain\_bytes})$
   - Assert: $H_{\text{domain}} = \text{claimed\_domain\_hash}$
   
   **Why hash the domain?** Provides zero-knowledge: the prover proves the domain matches a known hash (e.g., hash of "mit.edu") without revealing the email address itself.

3. **File size range** (if `reveal_size_range = true`):
   $$\text{claimed\_size\_min} \leq \text{file\_size} \leq \text{claimed\_size\_max}$$
   
   Example: Prove "file is between 1-5 MB" without revealing exact size.

4. **File type** (if `reveal_file_type = true`):
   $$\text{file\_type}[i] = \text{claimed\_file\_type}[i] \quad \forall i \in [0, 20)$$
   
   Byte-by-byte comparison to prove exact file type match.

**Circuit depth**: ~15,000-20,000 constraints (due to string operations and conditional checks)

**Proof generation time**: ~60-90s in-browser (WASM)

#### Why Selective Disclosure Matters

Traditional timestamping: **All or nothing** — reveal entire document or prove nothing.

Selective disclosure: **Fine-grained control** — prove specific properties while keeping the document private.

**Real-world example**:
- Timestamp a research paper
- Prove: "Authored by someone @stanford.edu, PDF format, 1-10 MB"
- Keeps: Title, content, author name all private
- Enables: Compliance checks, audit trails, access policies based on metadata

---

## Smart Contract Architecture

### Contract Hierarchy

```
┌─────────────────────────────┐
│  BasicTimestampVerifier.sol │  (Generated by bb)
│  • verify(proof, pubInputs) │
│  • Returns bool             │
└──────────────┬──────────────┘
               │
               │ Interface: ITimestampVerifier
               │
               ▼
┌─────────────────────────────┐
│  DisclosureVerifier.sol     │  (Generated by bb)
│  • verify(proof, pubInputs) │
│  • Returns bool             │
└──────────────┬──────────────┘
               │
               │ Interface: IDisclosureVerifier
               │
               ▼
┌─────────────────────────────┐
│  ProofOfExistence.sol       │  (Main contract)
│                             │
│  • submitProof()            │  Submit basic timestamp proof
│  • submitDisclosure()       │  Submit selective disclosure
│  • verifyExistence()        │  Check if commitment exists
│  • getUserCommitments()     │  Get user's commitments
│  • getDisclosureCount()     │  # of disclosures for commitment
│  • getDisclosure()          │  Fetch disclosure data
└─────────────────────────────┘
```

### Data Structures

#### CommitmentData

```solidity
struct CommitmentData {
    address submitter;      // Who submitted the proof
    uint256 timestamp;      // Block timestamp
    uint256 blockNumber;    // Block number
    bool exists;            // Existence flag (for lookups)
}
```

Stored as: `mapping(bytes32 => CommitmentData) public commitments`

**Key**: `bytes32 commitment` (the Pedersen commitment)

#### DisclosureData

```solidity
struct DisclosureData {
    bytes32 commitment;          // Parent commitment
    bool revealEmailDomain;      // Which properties disclosed
    bool revealSizeRange;
    bool revealFileType;
    bytes32 claimedDomainHash;   // Pedersen hash of email domain
    uint64 claimedSizeMin;       // File size range
    uint64 claimedSizeMax;
    bytes32[20] claimedFileType; // ASCII bytes of file type
    uint256 timestamp;           // Disclosure timestamp
    bool exists;
}
```

Stored as: `mapping(bytes32 => DisclosureData[]) public disclosures`

**Key**: `bytes32 commitment` → array of disclosures

**Why array?** Multiple disclosures can be made for the same commitment with different revealed properties.

### Contract Methods

#### submitProof()

```solidity
function submitProof(
    bytes calldata proof,
    bytes32 commitment,
    bytes32 timestampField
) external
```

**Flow**:
1. Check commitment doesn't already exist (prevent replay)
2. Construct public inputs: `[commitment, timestampField]`
3. Call `timestampVerifier.verify(proof, publicInputs)`
4. If valid, store commitment with `msg.sender`, `block.timestamp`, `block.number`
5. Emit `CommitmentSubmitted` event

**Gas cost**: ~250-450k (150k base + 200-300k for proof verification)

#### submitDisclosure()

```solidity
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
) external
```

**Flow**:
1. Require commitment exists (must submit basic proof first)
2. Construct 27 public inputs (commitment + flags + claimed values)
3. Call `disclosureVerifier.verify(proof, publicInputs)`
4. If valid, store disclosure and emit `DisclosureSubmitted` event

**Gas cost**: ~350-600k (200k base + 300-400k for complex proof verification)

#### verifyExistence()

```solidity
function verifyExistence(bytes32 commitment)
    external view returns (
        bool exists,
        address submitter,
        uint256 timestamp,
        uint256 blockNumber
    )
```

**No gas cost** (view function) — anyone can query for free.

---

## Frontend Implementation

### WASM Proof Generation Pipeline

```javascript
import { Noir } from '@noir-lang/noir_js'
import { UltraHonkBackend } from '@aztec/bb.js'
import circuitJson from './circuits/basic_timestamp.json'

async function generateProof(documentHash, salt, timestamp) {
    // 1. Compute Pedersen commitment (matches circuit)
    const commitment = await computeCommitment(documentHash, salt)
    
    // 2. Execute Noir circuit to generate witness
    const noir = new Noir(circuitJson)
    const { witness } = await noir.execute({
        document_hash: documentHash,
        salt: salt,
        commitment: commitment,
        current_timestamp: timestamp.toString()
    })
    
    // 3. Generate UltraHonk proof with Keccak
    const backend = new UltraHonkBackend(circuitJson.bytecode)
    const { proof, publicInputs } = await backend.generateProof(
        witness, 
        { keccak: true }  // Use Keccak for EVM compatibility
    )
    
    return { proof, publicInputs, commitment }
}
```

**Why WASM?**
- **Privacy**: Document never leaves browser
- **No backend**: Fully client-side proving
- **Cost**: No server costs for proof generation

**Challenges**:
- **Performance**: 30-60s for basic proofs, 60-90s for disclosure (vs. 5-20s native)
- **Memory**: Requires ~500MB-1GB browser memory
- **Browser compatibility**: Needs WASM threads + BigInt support

### Document Hashing

```javascript
async function hashDocument(file) {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = '0x' + hashArray.map(b => 
        b.toString(16).padStart(2, '0')
    ).join('')
    return hashHex
}
```

**SHA-256 → Field truncation**:
SHA-256 produces 256 bits, but BN254's field modulus is 254 bits. We truncate to 31 bytes (248 bits):

```javascript
function truncateToField(hash) {
    return '0x' + hash.slice(2, 64)  // Drop last 2 hex chars
}
```

This loses 8 bits of entropy (collision probability increases from $2^{-128}$ to $2^{-124}$ — still negligible).

### Salt Generation

```javascript
function generateSalt() {
    const saltBytes = new Uint8Array(31)  // 31 bytes = 248 bits
    crypto.getRandomValues(saltBytes)
    return '0x' + Array.from(saltBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}
```

**Security**: The salt must be:
1. **Random**: Cryptographically secure (use `crypto.getRandomValues`)
2. **Secret**: Never reveal publicly (breaks hiding property of Pedersen commitment)
3. **Stored**: User must save it to later prove document ownership

**Why 31 bytes?** Matches BN254 field element size (248 bits).

---

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Git**: For cloning the repository

### Quick Start (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/PrazwalR/ZK-Proof-of-Existence-System.git
cd ZK-Proof-of-Existence-System

# Install frontend dependencies
cd frontend
npm install

# Create .env file (copy from example)
cp .env.example .env
# Edit .env and add your Privy App ID:
# VITE_PRIVY_APP_ID=your_app_id_here

# Start development server
npm run dev

# Open http://localhost:5173
```

**Get testnet ETH**: Visit [Arbitrum Sepolia Faucet](https://faucet.arbitrum.io) to fund your wallet.

### Full Development Setup (Circuits + Contracts)

#### 1. Install Noir

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup -v 1.0.0-beta.11
```

Verify:
```bash
nargo --version  # Should show 1.0.0-beta.11
```

#### 2. Install Barretenberg

```bash
curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/master/barretenberg/cpp/installation/install | bash
bbup -v 0.87.2
```

Verify:
```bash
bb --version  # Should show 0.87.2
```

#### 3. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify:
```bash
forge --version  # Should show foundry 0.2.0+
```

#### 4. Compile Circuits

```bash
cd circuits/basic_timestamp
nargo compile
nargo test

# Generate Solidity verifier
bb write_vk -b target/basic_timestamp.json --oracle_hash keccak
bb contract -o target/HonkVerifier.sol --oracle_hash keccak

# Copy circuit JSON to frontend
cp target/basic_timestamp.json ../../frontend/src/circuits/

# Repeat for other circuits
cd ../commitment_helper && nargo compile
cp target/commitment_helper.json ../../frontend/src/circuits/

cd ../selective_disclosure
nargo compile && nargo test
bb write_vk -b target/selective_disclosure.json --oracle_hash keccak
bb contract -o target/HonkVerifier.sol --oracle_hash keccak
cp target/selective_disclosure.json ../../frontend/src/circuits/
```

#### 5. Deploy Contracts (Optional)

Only needed if you want your own instance. The frontend is pre-configured to use the deployed contracts at:
- **ProofOfExistence**: `0x808101B5659608f58A8cEebd682D674B6d97B509`
- **BasicTimestampVerifier**: `0x50E4C2daF598273FDb17B8C65942ef5D32622bD7`
- **DisclosureVerifier**: `0xcd2578E767D4D1f0bC3e3971609149968e8A3957`

To deploy your own:

```bash
# Copy verifiers to contracts
cp circuits/basic_timestamp/target/HonkVerifier.sol contracts/src/BasicTimestampVerifier.sol
cp circuits/selective_disclosure/target/HonkVerifier.sol contracts/src/DisclosureVerifier.sol

# ⚠️ IMPORTANT: Rename symbols in DisclosureVerifier.sol to avoid conflicts:
# HonkVerifier → DisclosureHonkVerifier
# All internal structs/functions must be prefixed with D_

cd contracts
forge install  # Install dependencies

# Create .env with your private key
echo 'PRIVATE_KEY=0x...' > ../.env
echo 'RPC_URL=https://sepolia-rollup.arbitrum.io/rpc' >> ../.env

# Deploy
source ../.env
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --broadcast --verify

# Update frontend/src/lib/contracts.js with new addresses
```

---

## Advanced Usage

### Batch Proof Submission

Submit multiple commitments in one transaction:

```javascript
const commitments = [/* array of commitment objects */]
const proofs = await Promise.all(commitments.map(c => generateProof(c)))

// Call batchSubmitProofs on contract
await contract.batchSubmitProofs(
    proofs.map(p => p.proof),
    proofs.map(p => p.commitment),
    proofs.map(p => p.timestampField)
)
```

**Gas savings**: ~30-40% per proof compared to individual submissions.

### Domain Verification

To verify a domain matches a disclosed domain hash:

```javascript
import { computeDomainHashFromDomain } from './lib/noir'

const domain = 'mit.edu'
const computedHash = await computeDomainHashFromDomain(domain)

if (computedHash === disclosureData.claimedDomainHash) {
    console.log('✅ Domain verified:', domain)
}
```

The frontend auto-checks common domains (gmail.com, yahoo.com, etc.) and provides a manual verifier.

### Custom Circuit Modifications

To add new properties to selective disclosure:

1. **Update Noir circuit** (`circuits/selective_disclosure/src/main.nr`):
   ```rust
   fn main(
       // ... existing params
       document_format: [u8; 10],  // New property
       reveal_format: pub bool,
       claimed_format: pub [u8; 10],
   ) {
       // Add constraint
       if reveal_format {
           for i in 0..10 {
               assert(document_format[i] == claimed_format[i]);
           }
       }
   }
   ```

2. **Recompile circuit**: `nargo compile && bb contract -o target/HonkVerifier.sol`

3. **Update contract**: Add new params to `DisclosureData` struct and `submitDisclosure()` function

4. **Update frontend**: Modify `generateDisclosureProof()` to include new property

---

## Mathematical Foundations

### Security Proofs

#### Pedersen Commitment Security

**Theorem (Hiding)**: If $r$ is uniformly random and unknown to the adversary, then $C = mG + rH$ reveals no information about $m$.

**Proof**: For any two messages $m_0, m_1$, the distributions of $m_0G + rH$ and $m_1G + rH$ are identical when $r$ is uniform. The adversary's advantage in distinguishing them is:

$$\Pr[\text{Adv distinguishes } m_0 \text{ vs } m_1] = \frac{1}{2}$$

(no better than random guessing).

**Theorem (Binding)**: Under the discrete logarithm assumption, it is computationally infeasible to find $(m, r) \neq (m', r')$ such that $mG + rH = m'G + r'H$.

**Proof sketch**: If an adversary finds such a collision, they compute:
$$(m - m')G = (r' - r)H$$

This gives $\log_G H = \frac{r' - r}{m - m'}$, solving the discrete log problem (contradicts the hardness assumption).

#### SNARK Soundness

**Definition**: A proof system is **sound** if no PPT adversary can produce a valid proof for a false statement.

For UltraHonk, soundness holds under the **q-Strong Bilinear Diffie-Hellman (q-SBDH)** assumption on BN254.

**Soundness error**: $\epsilon < 2^{-128}$ (negligible)

#### Zero-Knowledge Property

Our circuits achieve **perfect zero-knowledge**: the prover reveals:
1. The commitment $C$ (public input)
2. The timestamp $t$ (public input)
3. Optionally: claimed metadata (domain hash, size range, file type)

The prover does **not** reveal:
- The document hash $h$
- The salt $s$
- The full email address (only domain hash)
- The exact file size (only range)

**Formal statement**: For any verifier $V$, there exists a simulator $S$ that can produce transcripts indistinguishable from real proof transcripts without access to the witness $(h, s)$.

### Complexity Analysis

#### Circuit Sizes

| Circuit | Constraints | Gates | Proving time (native) | Proving time (WASM) |
|---|---|---|---|---|
| commitment_helper | ~512 | ~1,024 | <1s | ~2s |
| basic_timestamp | ~2,000 | ~4,000 | ~5s | ~30s |
| selective_disclosure | ~18,000 | ~36,000 | ~20s | ~90s |

**Why the WASM slowdown?** WASM lacks native field arithmetic instructions, requiring software emulation of 254-bit modular arithmetic.

#### Proof Sizes

All UltraHonk proofs are **constant size**: ~1.5 KB regardless of circuit complexity.

**Breakdown**:
- Polynomial commitments: 32 bytes × 8 = 256 bytes
- Opening proofs: 32 bytes × 4 = 128 bytes
- Fiat-Shamir challenges: 32 bytes × 6 = 192 bytes
- Public inputs: 32 bytes × $n$ (variable)
- Total: ~800-1500 bytes typical

#### Gas Costs

| Operation | Gas | Notes |
|---|---|---|
| Basic proof verification | 250-350k | 1 pairing, simple constraints |
| Disclosure verification | 350-500k | 2 pairings, complex constraints |
| Commitment storage | 20k | SSTORE new slot |
| Event emission | 1.5k | LOG3 |
| Public input calldata | 16 gas/byte | Ethereum calldata cost |

**Total transaction cost** for submitting a basic proof: ~300-400k gas (~$1-3 at 10 gwei gas price).

---

## Security Considerations

### Threat Model

**Trusted components**:
- **Frontend integrity**: User must trust the webapp hasn't been compromised (mitigation: open-source, self-host)
- **RPC provider**: Trust Arbitrum Sepolia RPC (mitigation: use your own node)

**Trustless components**:
- **Proof generation**: Deterministic; anyone can regenerate proofs locally
- **On-chain verification**: Mathematically sound; no trust in verifiers
- **Commitment binding**: Cryptographically secure under discrete log

### Attack Vectors & Mitigations

#### 1. Salt Leakage

**Attack**: If the salt is leaked, the commitment no longer hides the document hash.

**Mitigation**:
- Store salt securely (encrypted local storage or hardware wallet)
- Never log or transmit salt over insecure channels
- Frontend warns user to save salt securely

#### 2. Replay Attacks

**Attack**: Resubmit the same proof to claim a different timestamp.

**Mitigation**: Contract checks `CommitmentAlreadyExists` before accepting new proofs. Each commitment can only be submitted once.

#### 3. Frontrunning

**Attack**: Adversary sees your proof in the mempool and submits it first with a higher gas price.

**Mitigation**:
- Use private mempools (e.g., Flashbots Protect)
- The `msg.sender` is recorded, so the attacker gains nothing (they just pay your gas)

#### 4. Forgery Attempts

**Attack**: Submit an invalid proof to claim a document timestamp.

**Mitigation**: The on-chain verifier cryptographically checks proof validity. Soundness error is $< 2^{-128}$ — infeasible to forge.

#### 5. Quantum Threats

**Status**: BN254 (256-bit discrete log) is vulnerable to Shor's algorithm (polynomial-time quantum attack).

**Timeline**: Quantum computers with ~4000 logical qubits needed (current: ~1000 noisy qubits). Estimated 10-20 years until practical threat.

**Mitigation path**: Transition to post-quantum SNARKs (e.g., STARKs, lattice-based) when quantum threat materializes.

---

## Contributing

We welcome contributions! Areas for improvement:

- **Additional circuits**: Batch verification, recursive proofs, zk-rollups
- **Performance**: Optimize WASM proving (multi-threading, Web Workers)
- **Security audits**: Formal verification of circuits and contracts
- **Frontend**: Mobile support, PWA, offline proving
- **Documentation**: More examples, tutorials, video guides

**Contribution guidelines**:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## References

### Papers & Specifications

1. **PLONK**: Gabizon et al., ["PLONK: Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge"](https://eprint.iacr.org/2019/953) (2019)
2. **UltraPlonk**: Aztec, ["UltraPlonk: Extending PLONK with Custom Gates"](https://hackmd.io/@aztec-network/plonk-arithmetiization-air) (2020)
3. **Pedersen Commitments**: Pedersen, ["Non-Interactive and Information-Theoretic Secure Verifiable Secret Sharing"](https://link.springer.com/chapter/10.1007/3-540-46766-1_9) (1992)
4. **BN Curves**: Barreto & Naehrig, ["Pairing-Friendly Elliptic Curves of Prime Order"](https://eprint.iacr.org/2005/133) (2005)
5. **KZG Commitments**: Kate et al., ["Constant-Size Commitments to Polynomials and Their Applications"](https://www.iacr.org/archive/asiacrypt2010/6477178/6477178.pdf) (2010)

### Tools & Libraries

- [Noir Language](https://noir-lang.org) - ZK circuit DSL
- [Barretenberg](https://github.com/AztecProtocol/barretenberg) - C++ proving backend
- [Foundry](https://book.getfoundry.sh/) - Solidity development toolkit
- [Privy](https://privy.io) - Embedded wallet infrastructure
- [Arbitrum](https://arbitrum.io) - Ethereum L2 scaling solution

### Related Projects

- [Semaphore](https://semaphore.appliedzkp.org/) - ZK identity & signaling
- [MACI](https://maci.pse.dev/) - Minimal anti-collusion infrastructure
- [Dark Forest](https://zkga.me/) - ZK game using SNARK proofs
- [Tornado Cash](https://tornadocash.eth.limo/) - ZK privacy mixer (deprecated)
- [Aztec Protocol](https://aztec.network/) - ZK rollup with privacy

---

## Acknowledgments

Built with support from:
- **Aztec Labs** - Noir language & Barretenberg proving system
- **Ethereum Foundation** - ZK research grants
- **Arbitrum Foundation** - L2 deployment support
- **Privy** - Embedded wallet infrastructure

Special thanks to the ZK research community for foundational work on SNARKs, pairings, and commitment schemes.

---

## Contact

**Prazwal Ratti**
- **Email**: [prazwalr07@gmail.com](mailto:prazwalr07@gmail.com)
- **GitHub**: [@PrazwalR](https://github.com/PrazwalR)
- **Twitter/X**: [@RattiPrazwal](https://x.com/RattiPrazwal)
- **Project Repository**: [ZK-Proof-of-Existence-System](https://github.com/PrazwalR/ZK-Proof-of-Existence-System)

---

**Built with 🔐 by Prazwal Ratti**
