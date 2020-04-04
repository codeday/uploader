const stream = require('stream');
const path = require('path');
const { generate: randomString } = require('randomstring');
const detectContentType = require('detect-content-type');

/**
 * Converts a steam into a promise which can be awaited.
 *
 * @async
 * @param {stream} s    The original stream.
 * @returns {Promise}   Promise which returns the result of the 'end' or 'finish' event on the stream.
 */
exports.asyncStream = async (s) => new Promise((resolve, reject) => s
  .on('end', resolve)
  .on('finish', resolve)
  .on('error', reject));

/**
 * Converts a Buffer into a steam object which can be piped into an upload.
 *
 * @param {Buffer} buffer   Original buffer object.
 * @returns {stream}        Stream of buffer.
 */
exports.bufferToStream = (buffer) => {
  const bufferStream = new stream.PassThrough();
  return bufferStream.end(buffer);
};

/**
 * Converts a mime-type into a file extension.
 *
 * @param {string} mime   The mime-type to get.
 * @returns {string}      The file extension with leading dot, or empty-string if not found.
 */
const mimeToExt = (mime) => ({
  'text/plain': '.txt',
  'text/html': '.html',
  'image/bmp': '.bmp',
  'image/gif': '.gif',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/vnd.microsoft.icon': '.ico',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/avi': '.avi',
  'video/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/wave': '.wav',
  'audio/vnd.wave': '.wav',
  'audio/x-wav': '.wav',
  'audio/aiff': '.aiff',
  'audio/midi': '.midi',
  'application/ogg': '.ogg',
  'application/pdf': '.pdf',
  'application/x-rar-compressed': '.rar',
  'application/zip': '.zip',
  'application/x-gzip': '.tar.gz',

}[mime.split(';', 2)[0]]) || '';

/**
 * Gets a file extension for a file upload. Uses the original filename (if provided), the original mime-type (if
 * provided), or guesses the mime-type given the file contents.
 *
 * @param {object} file   The file to get the extension for.
 * @returns {string}      The guessed extension, or empty-string.
 */
module.exports.getFileExt = (file) => {
  const { originalname: originalName, mimetype: originalMime, buffer } = file;
  const originalExt = path.extname(originalName).toLowerCase();
  if (originalExt) return originalExt;

  if (originalMime && originalMime !== 'application/octet-stream') return mimeToExt(originalMime);
  return mimeToExt(detectContentType(buffer));
};

/**
 * Makes a random filename using printable characters, sharded into folders, and with the original extension.
 *
 * @param {object} file   The original file upload.
 * @returns {string}      The file name, with directories and extension (no leading slash).
 */
exports.makeFileName = (file) => {
  const randomName = randomString({
    // eslint-disable-next-line no-secrets/no-secrets
    charset: '123456789abcdefghijkmnopqrstuvwxyz',
    length: 66,
  });
  const ext = this.getFileExt(file);

  return `${randomName[0]}/${randomName[1]}/${randomName}${ext}`;
};
