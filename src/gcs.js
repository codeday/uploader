const Cloud = require('@google-cloud/storage');
const config = require('./config');
const utils = require('./utils');

const gcs = new Cloud.Storage({
  keyFilename: config.google.keyPath,
  projectId: config.google.project,
});

exports.upload = async (bucket, fileName, stream) => utils.asyncStream(stream.pipe(
  gcs
    .bucket(bucket)
    .file(fileName)
    .createWriteStream({ resumable: false })
));
