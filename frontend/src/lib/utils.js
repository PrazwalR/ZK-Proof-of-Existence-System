/**
 * Hash a file using SHA-256 via Web Crypto API
 * @param {File} file
 * @returns {Promise<string>} hex hash string (0x prefixed)
 */
export async function hashDocument(file) {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return '0x' + hashHex
}

/**
 * Truncate SHA-256 hash to 31 bytes to fit in BN254 Field
 * @param {string} hash - 0x prefixed 64-char hex
 * @returns {string} 0x prefixed 62-char hex (31 bytes)
 */
export function truncateToField(hash) {
    // Remove 0x, take first 62 chars (31 bytes = 248 bits < 254-bit field)
    return '0x' + hash.slice(2, 64)
}

/**
 * Generate a cryptographically secure random salt (31 bytes)
 * @returns {string} 0x prefixed hex salt
 */
export function generateSalt() {
    const saltBytes = new Uint8Array(31)
    crypto.getRandomValues(saltBytes)
    const saltHex = Array.from(saltBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    return '0x' + saltHex
}

/**
 * Convert a unix timestamp (seconds) to a bytes32 hex string
 * @param {number} timestamp
 * @returns {string} bytes32 hex
 */
export function timestampToBytes32(timestamp) {
    return '0x' + BigInt(timestamp).toString(16).padStart(64, '0')
}

/**
 * Format a bytes32 hex for display (truncated)
 * @param {string} hex
 * @param {number} chars
 * @returns {string}
 */
export function truncateHex(hex, chars = 8) {
    if (!hex) return ''
    return hex.slice(0, chars + 2) + '...' + hex.slice(-chars)
}

/**
 * Format a unix timestamp to readable date
 * @param {number} timestamp - unix seconds
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    })
}

/**
 * Format file size to human readable
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
