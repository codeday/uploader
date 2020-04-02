const config = require('./config');
const utils = require('./utils');
const gcs = require('./gcs');
const mux = require('./mux');

exports.image = async (file) => {
  const fileName = utils.makeFileName(file);
  await gcs.upload(config.google.bucket.images, fileName, utils.bufferToStream(file.buffer));

  return {
    id: fileName,
    url: `${config.google.urlBase.images.original}/${fileName}`,
    urlResize: `${config.google.urlBase.images.cropped}/${fileName}`,
  };
};

exports.file = async (file) => {
  const fileName = utils.makeFileName(file);
  await gcs.upload(config.google.bucket.files, fileName, utils.bufferToStream(file.buffer));

  return {
    id: fileName,
    url: `${config.google.urlBase.files}/${fileName}`,
  };
};

exports.video = async (file) => {
  const { id: sourceId, url } = await this.file(file);
  const id = await mux.createVideo(url);
  return {
    id,
    sourceId,
    url,
    stream: `https://stream.mux.com/${id}.m3u8`,
    image: `https://image.mux.com/${id}/thumbnail.png`,
  };
};
