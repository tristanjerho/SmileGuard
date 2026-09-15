/**
 * Cloudinary Image Upload Service for SmileGuard AI
 * Uses unsigned upload preset 'Ai Diagnostic' under cloud name 'tbrj7dq9'
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tbrj7dq9',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Ai Diagnostic',
};

/**
 * Uploads a file (File/Blob) directly to Cloudinary CDN
 * @param {File|Blob} file File object to upload
 * @param {string} [folder='dental_xrays'] Cloudinary folder path
 * @returns {Promise<{url: string, publicId: string, format: string, width: number, height: number, bytes: number}>}
 */
export const uploadToCloudinary = async (file, folder = 'dental_xrays') => {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;

  if (!file) {
    throw new Error('No file provided for Cloudinary upload.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `Cloudinary HTTP error ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Cloudinary Upload Failed:', error);
    throw error;
  }
};
