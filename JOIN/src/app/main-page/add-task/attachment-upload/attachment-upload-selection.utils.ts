/**
 * Result of filtering raw files down to supported attachment image types.
 */
export type AttachmentFileFilterResult = {
  validFiles: File[];
  hasTypeError: boolean;
};

/**
 * Filters a raw file list down to supported mime types.
 *
 * @param files Raw files selected by the user.
 * @param allowedMimeTypes Mime types accepted by the uploader.
 * @returns Supported files and whether unsupported files were encountered.
 */
export function filterAttachmentFiles(
  files: File[],
  allowedMimeTypes: readonly string[],
): AttachmentFileFilterResult {
  const validFiles = files.filter((file) => allowedMimeTypes.includes(file.type));
  return {
    validFiles,
    hasTypeError: validFiles.length !== files.length,
  };
}

/**
 * Merges new files into the current upload selection without duplicates.
 *
 * @param currentFiles Already selected files.
 * @param newFiles Newly chosen valid files.
 * @param getFileKey Stable key generator used to compare files.
 * @returns The updated unique file list.
 */
export function mergeAttachmentFiles(
  currentFiles: File[],
  newFiles: File[],
  getFileKey: (file: File) => string,
): File[] {
  const mergedFiles = [...currentFiles];
  newFiles.forEach((newFile) => appendUniqueFile(mergedFiles, newFile, getFileKey));
  return mergedFiles;
}

/**
 * Appends one file only when it is not yet part of the current selection.
 *
 * @param files Current merged file list.
 * @param candidateFile Candidate file to append.
 * @param getFileKey Stable key generator used to compare files.
 * @returns void
 */
function appendUniqueFile(
  files: File[],
  candidateFile: File,
  getFileKey: (file: File) => string,
): void {
  if (hasMatchingFile(files, candidateFile, getFileKey)) return;
  files.push(candidateFile);
}

/**
 * Checks whether one file already exists in the current selection.
 *
 * @param files Current merged file list.
 * @param candidateFile Candidate file to compare.
 * @param getFileKey Stable key generator used to compare files.
 * @returns `true` when the file already exists.
 */
function hasMatchingFile(
  files: File[],
  candidateFile: File,
  getFileKey: (file: File) => string,
): boolean {
  return files.some((existingFile) => getFileKey(existingFile) === getFileKey(candidateFile));
}
