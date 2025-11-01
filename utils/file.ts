export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Optional: small helper to limit image size or perform basic validation
export const validateImageFile = (file: File, maxBytes = 5 * 1024 * 1024) => {
  if (!file.type.startsWith('image/')) return 'Please select a valid image file';
  if (file.size > maxBytes) return `Image must be smaller than ${maxBytes / (1024 * 1024)}MB`;
  return null;
};
