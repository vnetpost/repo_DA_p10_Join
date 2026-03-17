/**
 * Stores and cleans up preview object URLs for selected browser files.
 */
export class AttachmentUploadPreviewStore {
  private previewUrlsByFileKey = new Map<string, string>();

  /**
   * Returns a stable identity key for one browser file.
   *
   * @param file Browser file reference.
   * @returns Stable file identity string.
   */
  getFileKey(file: File): string {
    return `${file.name}|${file.size}|${file.lastModified}`;
  }

  /**
   * Returns a cached or newly created preview URL for one file.
   *
   * @param file Selected browser file.
   * @returns Object URL used for thumbnail preview.
   */
  getPreviewUrl(file: File): string {
    const fileKey = this.getFileKey(file);
    const cachedUrl = this.previewUrlsByFileKey.get(fileKey);
    if (cachedUrl) return cachedUrl;
    const generatedUrl = URL.createObjectURL(file);
    this.previewUrlsByFileKey.set(fileKey, generatedUrl);
    return generatedUrl;
  }

  /**
   * Revokes the preview URL of one selected file.
   *
   * @param file Browser file whose preview should be released.
   * @returns void
   */
  revokePreviewUrl(file: File): void {
    const fileKey = this.getFileKey(file);
    const previewUrl = this.previewUrlsByFileKey.get(fileKey);
    if (!previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    this.previewUrlsByFileKey.delete(fileKey);
  }

  /**
   * Removes previews for files that are no longer selected.
   *
   * @param selectedFiles Current selected browser files.
   * @returns void
   */
  syncWithSelectedFiles(selectedFiles: File[]): void {
    const activeKeys = new Set(selectedFiles.map((file) => this.getFileKey(file)));
    for (const [previewKey, previewUrl] of this.previewUrlsByFileKey.entries()) {
      if (activeKeys.has(previewKey)) continue;
      URL.revokeObjectURL(previewUrl);
      this.previewUrlsByFileKey.delete(previewKey);
    }
  }

  /**
   * Releases all stored preview URLs.
   *
   * @returns void
   */
  clear(): void {
    for (const previewUrl of this.previewUrlsByFileKey.values()) {
      URL.revokeObjectURL(previewUrl);
    }

    this.previewUrlsByFileKey.clear();
  }
}
