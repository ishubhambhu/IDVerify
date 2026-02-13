/**
 * Resizes an image to a maximum width to save storage space.
 */
export const resizeImage = (file: File, maxWidth = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const scaleFactor = maxWidth / img.width;
        
        if (scaleFactor >= 1) {
            // No resize needed if smaller than max width
            resolve(img.src);
            return;
        }

        elem.width = maxWidth;
        elem.height = img.height * scaleFactor;
        const ctx = elem.getContext('2d');
        ctx?.drawImage(img, 0, 0, elem.width, elem.height);
        resolve(ctx?.canvas.toDataURL(file.type, 0.8) || '');
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
