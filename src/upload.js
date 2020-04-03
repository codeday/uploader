const config = require('./config');
const utils = require('./utils');
const gcs = require('./gcs');
const mux = require('./mux');

const allowedFiles = {
  image: ['.jpg', '.jpeg', '.bmp', '.png', '.gif'],
  video: ['.mov', '.mp4', '.webm', '.avi'],
};

/**
 * Uploads an arbitrary file.
 *
 * @async
 * @param {Buffer} file   The file to upload.
 * @returns {object}      File details: id and url.
 */
exports.file = async (file) => {
  const fileName = utils.makeFileName(file);
  await gcs.upload(config.google.bucket.files, fileName, utils.bufferToStream(file.buffer));

  return {
    id: fileName,
    url: `${config.google.urlBase.files}/${fileName}`,
  };
};

/**
 * Uploads an image file.
 *
 * @async
 * @param {Buffer} file   The image to upload.
 * @returns {object}      File details: id, url, and resizeUrl.
 */
exports.image = async (file) => {
  // Validate upload
  const ext = utils.getFileExt(file);
  if (allowedFiles.image.indexOf(ext) === -1) {
    return {
      error: `File extension was "${ext}" but must be one of: ${allowedFiles.image.join(', ')}`,
    };
  }

  const fileName = utils.makeFileName(file);
  await gcs.upload(config.google.bucket.images, fileName, utils.bufferToStream(file.buffer));

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
 * @param {Buffer} file   The file to upload.
 * @returns {object}      File details: id, sourceId, url, stream, image, and animatedImage.
 */
exports.video = async (file) => {
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
