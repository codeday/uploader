const Mux = require('@mux/mux-node');
const config = require('./config');

const mux = new Mux(config.mux.accessToken, config.mux.secretKey);

/**
 * Creates a video from URL in Mux, and returns the URL.
 *
 * @async
 * @param {string} url  The URL of the original file.
 * @returns {string}    The ID of a public playback for the file.
 */
exports.createVideo = async (url) => {
  const asset = await mux.Video.Assets.create({
    playback_policy: 'public',
    input: url,
  });
  return asset.playback_ids[0].id;
};
