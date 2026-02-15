/**
 * IPFS Service — Pinata Gateway
 *
 * Pins proof metadata and certificates to IPFS via the Pinata API.
 * Requires VITE_PINATA_JWT in .env.
 *
 * Pinata free tier: 100 pins, 500MB storage — more than enough for metadata.
 */

const PINATA_API = 'https://api.pinata.cloud'
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

function getJwt() {
    const jwt = import.meta.env.VITE_PINATA_JWT
    if (!jwt) {
        throw new Error(
            'VITE_PINATA_JWT not set. Add it to frontend/.env. ' +
            'Get a free key at https://app.pinata.cloud/developers/api-keys'
        )
    }
    return jwt
}

/**
 * Pin a JSON object to IPFS via Pinata.
 *
 * @param {object} jsonData - The JSON object to pin
 * @param {string} name - Human-readable pin name
 * @returns {Promise<{ cid: string, url: string }>}
 */
export async function pinJSON(jsonData, name = 'zkpoe-metadata') {
    const jwt = getJwt()

    const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
            pinataContent: jsonData,
            pinataMetadata: { name },
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Pinata pinJSON failed (${res.status}): ${err}`)
    }

    const data = await res.json()
    return {
        cid: data.IpfsHash,
        url: `${PINATA_GATEWAY}/${data.IpfsHash}`,
    }
}

/**
 * Pin a File/Blob to IPFS via Pinata.
 *
 * @param {File|Blob} file - The file to pin
 * @param {string} name - Human-readable pin name
 * @returns {Promise<{ cid: string, url: string }>}
 */
export async function pinFile(file, name = 'zkpoe-file') {
    const jwt = getJwt()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('pinataMetadata', JSON.stringify({ name }))

    const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
        body: formData,
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Pinata pinFile failed (${res.status}): ${err}`)
    }

    const data = await res.json()
    return {
        cid: data.IpfsHash,
        url: `${PINATA_GATEWAY}/${data.IpfsHash}`,
    }
}

/**
 * Build proof-of-existence metadata object for IPFS pinning.
 *
 * @param {object} params
 * @param {string} params.commitment - Pedersen commitment hex
 * @param {string} params.documentHash - SHA-256 hex
 * @param {string} params.txHash - On-chain transaction hash
 * @param {number} params.timestamp - Unix timestamp
 * @param {string} params.network - Network name
 * @param {string} params.contractAddress - Contract address
 * @param {string} params.submitter - Wallet address
 * @param {object} [params.disclosure] - Optional disclosure data
 * @returns {object} Metadata ready for pinning
 */
export function buildProofMetadata(params) {
    return {
        version: '1.0.0',
        type: 'zk-proof-of-existence',
        commitment: params.commitment,
        documentHash: params.documentHash,
        txHash: params.txHash,
        timestamp: params.timestamp,
        submittedAt: new Date(params.timestamp * 1000).toISOString(),
        network: params.network || 'Arbitrum Sepolia',
        chainId: 421614,
        contractAddress: params.contractAddress,
        submitter: params.submitter,
        verificationUrl: `https://sepolia.arbiscan.io/tx/${params.txHash}`,
        ...(params.disclosure && {
            disclosure: {
                revealEmailDomain: params.disclosure.revealEmailDomain || false,
                revealSizeRange: params.disclosure.revealSizeRange || false,
                revealFileType: params.disclosure.revealFileType || false,
                ...(params.disclosure.revealSizeRange && {
                    sizeRange: {
                        min: params.disclosure.sizeMin,
                        max: params.disclosure.sizeMax,
                    },
                }),
                ...(params.disclosure.revealFileType && {
                    fileType: params.disclosure.fileType,
                }),
            },
        }),
    }
}

/**
 * Pin proof metadata to IPFS. Returns CID and gateway URL.
 *
 * @param {object} proofParams - Same as buildProofMetadata params
 * @returns {Promise<{ cid: string, url: string, metadata: object }>}
 */
export async function pinProofToIPFS(proofParams) {
    const metadata = buildProofMetadata(proofParams)
    const result = await pinJSON(metadata, `zkpoe-${proofParams.commitment?.slice(0, 10)}`)
    return { ...result, metadata }
}

/**
 * Check if Pinata JWT is configured.
 * @returns {boolean}
 */
export function isPinataConfigured() {
    return !!import.meta.env.VITE_PINATA_JWT
}

/**
 * Get the IPFS gateway URL for a CID.
 * @param {string} cid
 * @returns {string}
 */
export function getIPFSUrl(cid) {
    return `${PINATA_GATEWAY}/${cid}`
}
