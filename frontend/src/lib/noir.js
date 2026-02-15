/**
 * NoirJS Proof Generation Service
 *
 * Uses @noir-lang/noir_js for witness generation and @aztec/bb.js for
 * UltraHonk proof generation — all running in-browser via WASM.
 *
 * Flow:
 *   1. Compute Pedersen commitment: commitment_helper circuit (document_hash, salt) → commitment
 *   2. Generate ZK proof: basic_timestamp circuit (document_hash, salt, commitment, timestamp) → proof
 *   3. Return { proof, publicInputs, commitment } ready for on-chain submission
 */
import { Noir } from '@noir-lang/noir_js'
import initNoirC from '@noir-lang/noirc_abi'
import initACVM from '@noir-lang/acvm_js'
import acvm from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url'
import noirc from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url'
import { Barretenberg, Fr, UltraHonkBackend } from '@aztec/bb.js'

import commitmentHelperCircuit from '../circuits/commitment_helper.json'
import basicTimestampCircuit from '../circuits/basic_timestamp.json'
import selectiveDisclosureCircuit from '../circuits/selective_disclosure.json'

let wasmInitialized = false

/**
 * Initialize WASM modules (idempotent — safe to call multiple times)
 */
async function initWasm() {
    if (wasmInitialized) return
    await Promise.all([
        initACVM(fetch(acvm)),
        initNoirC(fetch(noirc)),
    ])
    wasmInitialized = true
}

/**
 * Compute Pedersen commitment using the commitment_helper circuit.
 * This gives the exact same result as the on-chain Noir verification.
 *
 * @param {string} documentHash - Field element hex string (0x...)
 * @param {string} salt - Field element hex string (0x...)
 * @returns {Promise<string>} commitment as hex string
 */
export async function computeCommitment(documentHash, salt) {
    await initWasm()

    const noir = new Noir(commitmentHelperCircuit)
    const { returnValue } = await noir.execute({
        document_hash: documentHash,
        salt: salt,
    })

    // returnValue is the commitment (pub Field output)
    return returnValue
}

/**
 * Generate a ZK proof for the basic_timestamp circuit.
 *
 * @param {string} documentHash - Field element hex string (0x...)
 * @param {string} salt - Field element hex string (0x...)
 * @param {string} commitment - Pedersen commitment hex (from computeCommitment)
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {function} onProgress - Optional progress callback (stage: string)
 * @returns {Promise<{ proof: Uint8Array, publicInputs: string[], commitment: string }>}
 */
export async function generateProof(documentHash, salt, commitment, timestamp, onProgress) {
    await initWasm()
    onProgress?.('Initializing Noir circuit...')

    // 1. Execute circuit to get witness
    const noir = new Noir(basicTimestampCircuit)
    onProgress?.('Generating witness...')

    const { witness } = await noir.execute({
        document_hash: documentHash,
        salt: salt,
        commitment: commitment,
        current_timestamp: timestamp.toString(),
    })

    // 2. Generate proof using UltraHonk backend with keccak for EVM verification
    onProgress?.('Initializing proving backend (WASM)...')
    const backend = new UltraHonkBackend(basicTimestampCircuit.bytecode)

    onProgress?.('Generating UltraHonk proof... (this may take 10-30s)')
    const { proof, publicInputs } = await backend.generateProof(witness, { keccak: true })

    onProgress?.('Proof generated!')

    // Clean up
    await backend.destroy?.()

    return {
        proof,
        publicInputs,
        commitment,
    }
}

/**
 * Convert proof Uint8Array to hex string for contract submission
 * @param {Uint8Array} proof
 * @returns {string} 0x-prefixed hex string
 */
export function proofToHex(proof) {
    return '0x' + Array.from(proof).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Convert a commitment Field value to bytes32 for contract submission
 * @param {string} commitment - Field as hex or decimal string
 * @returns {string} 0x-prefixed 32-byte hex string
 */
export function commitmentToBytes32(commitment) {
    // If it's already 0x-prefixed hex
    if (typeof commitment === 'string' && commitment.startsWith('0x')) {
        return commitment.padEnd(66, '0').slice(0, 66)
    }
    // If it's a decimal string, convert to hex
    const hex = BigInt(commitment).toString(16)
    return '0x' + hex.padStart(64, '0')
}

/**
 * Convert a string to a padded u8 byte array for Noir circuit input.
 * @param {string} str - Input string
 * @param {number} length - Target array length
 * @returns {string[]} Array of numeric strings
 */
export function stringToNoirBytes(str, length) {
    const bytes = new Array(length).fill('0')
    const encoder = new TextEncoder()
    const encoded = encoder.encode(str)
    for (let i = 0; i < Math.min(encoded.length, length); i++) {
        bytes[i] = encoded[i].toString()
    }
    return bytes
}

/**
 * Compute the Pedersen domain hash matching the Noir circuit's extract_domain_hash.
 * Takes a plain domain string (e.g. "gmail.com") or full email, pads to [u8;50],
 * and computes pedersen_hash([Field; 50]).
 *
 * @param {string} domainOrEmail - Domain string or full email address
 * @returns {Promise<string>} Domain hash as 0x-prefixed hex string
 */
export async function computeDomainHashFromDomain(domainOrEmail) {
    await initWasm()

    // Extract domain if full email given
    const atIndex = domainOrEmail.indexOf('@')
    const domain = atIndex >= 0 ? domainOrEmail.slice(atIndex + 1) : domainOrEmail

    // Pad domain to 50 bytes (matching Noir circuit)
    const domainPadded = new Array(50).fill(0)
    const encoder = new TextEncoder()
    const encoded = encoder.encode(domain)
    for (let i = 0; i < Math.min(encoded.length, 50); i++) {
        domainPadded[i] = encoded[i]
    }

    // Use Barretenberg to compute Pedersen hash matching the circuit
    const bb = await Barretenberg.new()
    const domainFields = domainPadded.map(b => new Fr(BigInt(b)))
    const hashResult = await bb.pedersenHash(domainFields, 0)
    const hashBytes = hashResult.toBuffer ? hashResult.toBuffer() : hashResult.value || hashResult
    const hex = '0x' + Array.from(new Uint8Array(hashBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    await bb.destroy()
    return hex
}

/**
 * Generate a ZK proof for the selective_disclosure circuit.
 *
 * @param {object} params
 * @param {string} params.documentHash - Field element hex string (0x...)
 * @param {string} params.salt - Field element hex string (0x...)
 * @param {string} params.commitment - Pedersen commitment hex
 * @param {string} params.authorEmail - Author email (up to 100 chars)
 * @param {number} params.fileSize - File size in bytes
 * @param {string} params.fileType - File type/extension (up to 20 chars, e.g. "pdf")
 * @param {boolean} params.revealEmailDomain - Whether to reveal email domain
 * @param {boolean} params.revealSizeRange - Whether to reveal file size range
 * @param {boolean} params.revealFileType - Whether to reveal file type
 * @param {number} params.claimedSizeMin - Claimed minimum file size
 * @param {number} params.claimedSizeMax - Claimed maximum file size
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<{ proof: Uint8Array, publicInputs: string[] }>}
 */
export async function generateDisclosureProof(params, onProgress) {
    await initWasm()
    onProgress?.('Initializing selective disclosure circuit...')

    const {
        documentHash, salt, commitment,
        authorEmail, fileSize, fileType,
        revealEmailDomain, revealSizeRange, revealFileType,
        claimedSizeMin, claimedSizeMax,
    } = params

    // Prepare byte arrays matching Noir circuit expectations
    const emailBytes = stringToNoirBytes(authorEmail, 100)
    const fileTypeBytes = stringToNoirBytes(fileType, 20)

    // Claimed file type as [u8;20] — matches what user wants to prove
    const claimedFileTypeBytes = revealFileType
        ? stringToNoirBytes(fileType, 20)
        : new Array(20).fill('0')

    // For domain hash: the circuit computes it internally from the email.
    // We need to supply a claimed_domain_hash that matches.
    // We'll compute it by running the circuit in a preliminary way,
    // but actually, the circuit asserts email_domain_hash == claimed_domain_hash
    // only when reveal_email_domain is true. We need to compute it externally.
    // Use a small helper: pedersen_hash of domain bytes as Fields.
    // Since we can't easily call pedersen_hash from JS alone, we'll use
    // a workaround: run the commitment_helper circuit won't work for this.
    // Instead, we pass 0x0 when not revealing, and when revealing we need
    // the actual hash. We'll compute it using bb.js Barretenberg instance.
    let claimedDomainHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
    if (revealEmailDomain) {
        // Compute domain hash via Barretenberg Pedersen
        const atIndex = authorEmail.indexOf('@')
        const domain = atIndex >= 0 ? authorEmail.slice(atIndex + 1) : authorEmail
        const domainPadded = new Array(50).fill(0)
        const encoder = new TextEncoder()
        const encoded = encoder.encode(domain)
        for (let i = 0; i < Math.min(encoded.length, 50); i++) {
            domainPadded[i] = encoded[i]
        }

        // Use Barretenberg to compute Pedersen hash matching the circuit
        const bb = await Barretenberg.new()
        const domainFields = domainPadded.map(b => new Fr(BigInt(b)))
        const hashResult = await bb.pedersenHash(domainFields, 0)
        // hashResult is a Fr — get its buffer and convert to hex
        const hashBytes = hashResult.toBuffer ? hashResult.toBuffer() : hashResult.value || hashResult
        claimedDomainHash = '0x' + Array.from(new Uint8Array(hashBytes))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        await bb.destroy()
    }

    // Build circuit inputs
    const circuitInputs = {
        document_hash: documentHash,
        salt: salt,
        author_email: emailBytes,
        file_size: fileSize.toString(),
        file_type: fileTypeBytes,
        commitment: commitment,
        reveal_email_domain: revealEmailDomain,
        reveal_size_range: revealSizeRange,
        reveal_file_type: revealFileType,
        claimed_domain_hash: claimedDomainHash,
        claimed_size_min: (claimedSizeMin || 0).toString(),
        claimed_size_max: (claimedSizeMax || 0).toString(),
        claimed_file_type: claimedFileTypeBytes,
    }

    // 1. Execute circuit to get witness
    const noir = new Noir(selectiveDisclosureCircuit)
    onProgress?.('Generating witness for selective disclosure...')
    const { witness } = await noir.execute(circuitInputs)

    // 2. Generate proof using UltraHonk backend
    onProgress?.('Initializing UltraHonk backend (WASM)...')
    const backend = new UltraHonkBackend(selectiveDisclosureCircuit.bytecode)

    onProgress?.('Generating UltraHonk proof... (this may take 30-60s)')
    const { proof, publicInputs } = await backend.generateProof(witness, { keccak: true })

    onProgress?.('Selective disclosure proof generated!')

    await backend.destroy?.()

    return {
        proof,
        publicInputs,
        claimedDomainHash,
    }
}
