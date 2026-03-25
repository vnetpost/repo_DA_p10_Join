import { Injectable } from '@angular/core';

export type ImageProcessingOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

type ImageDimensions = {
  width: number;
  height: number;
};

/**
 * Handles browser-side image resizing and data URL conversion.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageProcessingService {
  private readonly defaultMaxWidth = 800;
  private readonly defaultMaxHeight = 800;
  private readonly defaultQuality = 0.8;
  private readonly pngColorLevels = 32;

  /**
   * Reads an image file as a processed data URL.
   *
   * Supported JPEG and PNG uploads keep their original MIME type.
   *
   * @param file Selected browser file.
   * @param options Optional resize and quality settings.
   * @returns Processed data URL or `null`.
   */
  async readProcessedImage(
    file: File,
    options: ImageProcessingOptions = {}
  ): Promise<string | null> {
    const originalDataUrl = await this.readFileAsDataUrl(file);
    if (!originalDataUrl) return null;

    const outputMimeType = this.resolveOutputMimeType(file.type);
    const compressedDataUrl = await this.compressImage(file, outputMimeType, options);
    if (outputMimeType !== 'image/png') {
      return this.getSmallestDataUrl([compressedDataUrl, originalDataUrl]);
    }

    const optimizedPngDataUrl = await this.compressPngImage(originalDataUrl, options);
    return this.getSmallestDataUrl([optimizedPngDataUrl, compressedDataUrl, originalDataUrl]);
  }

  /**
   * Reads a file as a base64 data URL.
   *
   * @param file Selected browser file.
   * @returns Data URL string or `null`.
   */
  readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(this.getReaderResult(reader));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resolves the exported MIME type for one processed image.
   *
   * @param mimeType Original browser MIME type.
   * @returns Output MIME type.
   */
  resolveOutputMimeType(mimeType: string): string {
    if (mimeType === 'image/png') return 'image/png';
    if (mimeType === 'image/jpeg') return 'image/jpeg';
    return 'image/jpeg';
  }

  /**
   * Compresses and resizes one image file.
   *
   * @param file Selected browser file.
   * @param outputMimeType MIME type used for canvas export.
   * @param options Optional resize and quality settings.
   * @returns Processed data URL or `null`.
   */
  private compressImage(
    file: File,
    outputMimeType: string,
    options: ImageProcessingOptions
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => this.handleCompressionReaderLoad(event, outputMimeType, options, resolve);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Applies additional PNG optimization while preserving the PNG type.
   *
   * The optimization reduces the color precision before re-encoding the image,
   * which gives the browser encoder a better chance to produce a smaller PNG.
   *
   * @param imageSource Data URL of the original PNG file.
   * @param options Optional resize settings.
   * @returns Optimized PNG data URL or `null`.
   */
  private compressPngImage(
    imageSource: string,
    options: ImageProcessingOptions
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => this.handlePngOptimizationLoad(image, options, resolve);
      image.onerror = () => resolve(null);
      image.src = imageSource;
    });
  }

  /**
   * Extracts the string result from a FileReader instance.
   *
   * @param reader Browser FileReader.
   * @returns Data URL string or `null`.
   */
  private getReaderResult(reader: FileReader): string | null {
    const result = reader.result;
    return typeof result === 'string' ? result : null;
  }

  /**
   * Handles the file reader step of one compression run.
   *
   * @param event Browser load event.
   * @param outputMimeType MIME type used for canvas export.
   * @param options Optional resize and quality settings.
   * @param resolve Promise resolver for the processed image.
   * @returns void
   */
  private handleCompressionReaderLoad(
    event: ProgressEvent<FileReader>,
    outputMimeType: string,
    options: ImageProcessingOptions,
    resolve: (value: string | null) => void
  ): void {
    const imageSource = event.target?.result;
    if (typeof imageSource !== 'string') return resolve(null);
    const image = this.createCompressionImage(outputMimeType, options, resolve);
    image.src = imageSource;
  }

  /**
   * Creates the image element used during compression.
   *
   * @param outputMimeType MIME type used for canvas export.
   * @param options Optional resize and quality settings.
   * @param resolve Promise resolver for the processed image.
   * @returns Configured image element.
   */
  private createCompressionImage(
    outputMimeType: string,
    options: ImageProcessingOptions,
    resolve: (value: string | null) => void
  ): HTMLImageElement {
    const image = new Image();
    image.onload = () => this.handleCompressionImageLoad(image, outputMimeType, options, resolve);
    image.onerror = () => resolve(null);
    return image;
  }

  /**
   * Handles the loaded image step of one compression run.
   *
   * @param image Loaded image element.
   * @param outputMimeType MIME type used for canvas export.
   * @param options Optional resize and quality settings.
   * @param resolve Promise resolver for the processed image.
   * @returns void
   */
  private handleCompressionImageLoad(
    image: HTMLImageElement,
    outputMimeType: string,
    options: ImageProcessingOptions,
    resolve: (value: string | null) => void
  ): void {
    const canvas = this.createCompressionCanvas(image, options);
    const context = canvas.getContext('2d');
    if (!context) return resolve(null);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL(outputMimeType, this.resolveQuality(options)));
  }

  /**
   * Handles the loaded image step for PNG optimization.
   *
   * @param image Loaded image element.
   * @param options Optional resize and quality settings.
   * @param resolve Promise resolver for the optimized image.
   * @returns void
   */
  private handlePngOptimizationLoad(
    image: HTMLImageElement,
    options: ImageProcessingOptions,
    resolve: (value: string | null) => void
  ): void {
    const canvas = this.createCompressionCanvas(image, options);
    const context = canvas.getContext('2d');
    if (!context) return resolve(null);

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.quantizePngImageData(imageData.data);
    context.putImageData(imageData, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  }

  /**
   * Creates the target canvas for one loaded image.
   *
   * @param image Loaded image element.
   * @param options Optional resize settings.
   * @returns Sized canvas element.
   */
  private createCompressionCanvas(
    image: HTMLImageElement,
    options: ImageProcessingOptions
  ): HTMLCanvasElement {
    const dimensions = this.calculateImageDimensions(image.width, image.height, options);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    return canvas;
  }

  /**
   * Reduces PNG color precision to make the encoded image more compressible.
   *
   * Alpha values are kept untouched to avoid visible transparency artifacts.
   *
   * @param pixelData RGBA image data buffer.
   * @returns void
   */
  private quantizePngImageData(pixelData: Uint8ClampedArray): void {
    const maxChannelValue = 255;
    const step = maxChannelValue / (this.pngColorLevels - 1);

    for (let index = 0; index < pixelData.length; index += 4) {
      pixelData[index] = this.quantizeChannel(pixelData[index], step);
      pixelData[index + 1] = this.quantizeChannel(pixelData[index + 1], step);
      pixelData[index + 2] = this.quantizeChannel(pixelData[index + 2], step);
    }
  }

  /**
   * Snaps one color channel value to the nearest reduced palette step.
   *
   * @param value Original channel value.
   * @param step Distance between two palette values.
   * @returns Quantized channel value.
   */
  private quantizeChannel(value: number, step: number): number {
    return Math.round(value / step) * step;
  }

  /**
   * Calculates the constrained image dimensions.
   *
   * @param width Original image width.
   * @param height Original image height.
   * @param options Optional resize settings.
   * @returns Constrained width and height.
   */
  private calculateImageDimensions(
    width: number,
    height: number,
    options: ImageProcessingOptions
  ): ImageDimensions {
    const maxWidth = this.resolveMaxWidth(options);
    const maxHeight = this.resolveMaxHeight(options);
    if (width <= maxWidth && height <= maxHeight) return this.roundDimensions({ width, height });
    return width > height
      ? this.roundDimensions(this.scaleFromWidth(width, height, maxWidth))
      : this.roundDimensions(this.scaleFromHeight(width, height, maxHeight));
  }

  /**
   * Rounds one dimension pair to whole pixels.
   *
   * @param dimensions Raw width and height.
   * @returns Rounded width and height.
   */
  private roundDimensions(dimensions: ImageDimensions): ImageDimensions {
    return {
      width: Math.round(dimensions.width),
      height: Math.round(dimensions.height),
    };
  }

  /**
   * Scales one image using the width limit.
   *
   * @param width Original image width.
   * @param height Original image height.
   * @param maxWidth Maximum width.
   * @returns Scaled dimensions.
   */
  private scaleFromWidth(width: number, height: number, maxWidth: number): ImageDimensions {
    return { width: maxWidth, height: (height * maxWidth) / width };
  }

  /**
   * Scales one image using the height limit.
   *
   * @param width Original image width.
   * @param height Original image height.
   * @param maxHeight Maximum height.
   * @returns Scaled dimensions.
   */
  private scaleFromHeight(width: number, height: number, maxHeight: number): ImageDimensions {
    return { width: (width * maxHeight) / height, height: maxHeight };
  }

  /**
   * Resolves the maximum width for one processing run.
   *
   * @param options Optional resize settings.
   * @returns Effective width limit.
   */
  private resolveMaxWidth(options: ImageProcessingOptions): number {
    return options.maxWidth ?? this.defaultMaxWidth;
  }

  /**
   * Resolves the maximum height for one processing run.
   *
   * @param options Optional resize settings.
   * @returns Effective height limit.
   */
  private resolveMaxHeight(options: ImageProcessingOptions): number {
    return options.maxHeight ?? this.defaultMaxHeight;
  }

  /**
   * Resolves the quality setting for one processing run.
   *
   * @param options Optional quality setting.
   * @returns Effective quality value.
   */
  private resolveQuality(options: ImageProcessingOptions): number {
    return options.quality ?? this.defaultQuality;
  }

  /**
   * Returns the smallest available data URL by raw string length.
   *
   * @param candidates Candidate data URLs, possibly containing `null`.
   * @returns Shortest non-empty data URL or `null` when none are available.
   */
  private getSmallestDataUrl(candidates: Array<string | null>): string | null {
    const availableDataUrls = candidates.filter((candidate): candidate is string => Boolean(candidate));
    if (!availableDataUrls.length) return null;

    return availableDataUrls.reduce((smallest, candidate) => {
      return candidate.length < smallest.length ? candidate : smallest;
    });
  }
}
