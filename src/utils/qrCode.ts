/**
 * QR Code utility functions for asset management
 */

export interface QRCodeData {
  assetId: string;
  assetName: string;
  category: string;
  location: string;
  status: string;
  timestamp: string;
}

/**
 * Generate QR code data for an asset
 * @param assetId - Unique asset identifier
 * @param assetName - Name of the asset
 * @param category - Asset category
 * @param location - Asset location
 * @param status - Asset status
 * @returns JSON string to encode in QR code
 */
export function generateAssetQRData(
  assetId: string,
  assetName: string,
  category: string,
  location: string,
  status: string
): string {
  const qrData: QRCodeData = {
    assetId,
    assetName,
    category,
    location,
    status,
    timestamp: new Date().toISOString()
  };
  return JSON.stringify(qrData);
}

/**
 * Download QR code as PNG image
 * @param elementId - ID of the QR code canvas element
 * @param assetName - Name of the asset (for filename)
 */
export function downloadQRCode(elementId: string, assetName: string): void {
  const qrElement = document.getElementById(elementId) as HTMLCanvasElement;
  if (!qrElement) {
    console.error('QR code element not found');
    return;
  }

  try {
    // Get canvas from the QR code component
    const canvas = qrElement.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found in QR code element');
      return;
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assetName.replace(/\s+/g, '_')}_QR_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Error downloading QR code:', error);
  }
}

/**
 * Generate a shareable URL for the asset with QR code embedded
 * @param baseUrl - Base URL of the application
 * @param assetId - Asset ID
 * @returns Full URL for sharing
 */
export function generateAssetShareUrl(baseUrl: string, assetId: string): string {
  return `${baseUrl}/asset/${assetId}`;
}
