export class ImageHelper {
  /**
   * Validates if a string is a valid base64 data URL image
   */
  static isValidBase64Image(dataUrl: string): boolean {
    const regex = /^data:image\/(jpeg|png|gif|bmp);base64,/;
    return regex.test(dataUrl);
  }

  /**
   * Calculates the size of a base64 data URL image in MB
   */
  static getBase64ImageSizeInMB(dataUrl: string): number {
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) return 0;

    // Base64 size calculation: 3/4 * length
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes / (1024 * 1024);
  }
}
