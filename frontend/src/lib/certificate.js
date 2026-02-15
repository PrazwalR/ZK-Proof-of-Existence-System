/**
 * Certificate Generator
 *
 * Generates a visual proof-of-existence certificate as a
 * downloadable PNG or PDF. Uses html2canvas + jsPDF.
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Render a certificate DOM element to a PNG Blob.
 * @param {HTMLElement} element - The certificate DOM node
 * @returns {Promise<Blob>}
 */
export async function certificateToBlob(element) {
    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
    })
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0)
    })
}

/**
 * Download the certificate as a PNG.
 * @param {HTMLElement} element - The certificate DOM node
 * @param {string} filename - File name (without extension)
 */
export async function downloadCertificatePNG(element, filename = 'zkpoe-certificate') {
    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
    })

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
}

/**
 * Download the certificate as a PDF.
 * @param {HTMLElement} element - The certificate DOM node
 * @param {string} filename - File name (without extension)
 */
export async function downloadCertificatePDF(element, filename = 'zkpoe-certificate') {
    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save(`${filename}.pdf`)
}
