const fs = require('fs');
const config = require('./config');
const utils = require('./utils');
const gcs = require('./gcs');
const mux = require('./mux');

const allowedFiles = {
  image: ['.jpg', '.jpeg', '.bmp', '.png', '.gif'],
  video: ['.mov', '.mp4', '.webm', '.avi', '.mkv', '.ogg', '.mp3', '.mp4', 'wav'],
};

/**
 * Takes a file in arbitrary format and, if necessary, creates a startBuffer and stream object.
 *
 * @async
 * @param {object}    Original file object from upload. Must contain either buffer or path.
 * @returns {object}  Original object with startBuffer and stream set. startBuffer contains the first 2k of the file.
 */
const processFile = async ({
  stream, buffer, path, ...rest
}) => {
  // File was already processed
  if (stream && rest.startBuffer) {
    return {
      startBuffer: rest.startBuffer,
      buffer,
      stream,
      ...rest,
    };
  }

  // File is in-memory
  if (buffer) {
    return {
      startBuffer: buffer,
      buffer,
      stream: utils.bufferToStream(buffer),
      ...rest,
    };
  }

  const handle = await fs.promises.open(path, 'r');
  const startBuffer = await handle.read(Buffer.alloc(2048), 0, 2048, 0);
  await handle.close();

  return {
    startBuffer,
    buffer: null,
    stream: fs.createReadStream(path),
    ...rest,
  };
};

/**
 * Uploads an arbitrary file.
 *
 * @async
 * @param {Buffer} originalFile   The file to upload.
 * @returns {object}              File details: id and url.
 */
exports.file = async (originalFile) => {
  const file = await processFile(originalFile);
  const fileName = utils.makeFileName(file);
  await gcs.upload(config.google.bucket.files, fileName, file.stream);

  return {
    id: fileName,
    url: `${config.google.urlBase.files}/${fileName}`,
  };
};

/**
 * Uploads an image file.
 *
 * @async
 * @param {Buffer} originalFile   The file to upload.
 * @returns {object}              File details: id, url, and resizeUrl.
 */
exports.image = async (originalFile) => {
  const file = await processFile(originalFile);

  // Validate upload
  const ext = utils.getFileExt(file);
  if (allowedFiles.image.indexOf(ext) === -1) {
    return {
      error: `File extension was "${ext}" but must be one of: ${allowedFiles.image.join(', ')}`,
    };
  }

  const fileName = utils.makeFileName(file);
  await gcs.upload(config.google.bucket.images, fileName, file.stream);

  return {
    id: fileName,
    url: `${config.google.urlBase.images.original}/${fileName}`,
    urlResize: `${config.google.urlBase.images.cropped}/${fileName}`,
  };
};

/**
 * Uploads a video.
 *
 * @async
 * @param {Buffer} originalFile   The file to upload.
 * @returns {object}              File details: id, sourceId, url, stream, image, and animatedImage.
 */
exports.video = async (originalFile) => {
  const file = await processFile(originalFile);

  // Validate upload
  const ext = utils.getFileExt(file);
  if (allowedFiles.video.indexOf(ext) === -1) {
    return {
      error: `File extension was "${ext}" but must be one of: ${allowedFiles.video.join(', ')}`,
    };
  }

  const { id: sourceId, url } = await this.file(file);
  const id = await mux.createVideo(url);
  return {
    id,
    sourceId,
    url,
    stream: `https://stream.mux.com/${id}.m3u8`,
    image: `https://image.mux.com/${id}/thumbnail.png`,
    animatedImage: `https://image.mux.com/${id}/animated.gif`,
  };
};
