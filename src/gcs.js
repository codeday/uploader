const Cloud = require('@google-cloud/storage');
const config = require('./config');
const utils = require('./utils');

const gcs = new Cloud.Storage({
  keyFilename: config.google.keyPath,
  projectId: config.google.project,
});

/**
 * Uploads a file to Google Storage.
 *
 * @async
 * @param {string} bucket     The name of the bucket to upload the file to.
 * @param {string} fileName   The name of the file to create in the bucket.
 * @param {stream} stream     The stream of the file to upload.
 * @returns {object}          The file upload details from Google.
 */
exports.upload = async (bucket, fileName, stream) => utils.asyncStream(stream.pipe(
  gcs
    .bucket(bucket)
    .file(fileName)
    .createWriteStream({ resumable: false })
));
