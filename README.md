# Uploader

An internal service which makes it easy for backend services to upload images, videos, and other files to the CDN,
without knowing the implementation details.

## Configuration

Set the following environment variables:

- `SECRET` - Optional, shared secret which must be passed as `?secret` in the query string.
- `GOOGLE_APPLICATION_CREDENTIALS` - The path to the Google Cloud `account.json` file for authentication.
- `GOOGLE_PROJECT` - The Google Cloud project to use
- `FILE_BUCKET` - The bucket name to use for files
- `FILE_URL_BASE` - The base URL for viewing files on the web. (e.g. `https://uploads.codeday.org`)
- `IMAGE_BUCKET` - The bucket name to use for images
- `IMAGE_URL_ORIGINAL_BASE` - The base URL for viewing original files on the web. (e.g. `https://img.codeday.org/o`)
- `IMAGE_URL_CROPPED_BASE` - The base URL for viewing cropped files on the web. (e.g. `https://img.codeday.org/{width}x{height}`)
- `MUX_ACCESS_TOKEN` - Access token from Mux, for videos
- `MUX_SECRET_KEY` - Secret key from Mux, for videos

This is meant to be an internal service which is not exposed to the web. If you are exposing it to the web, you can get
some amount of security by setting `SECRET`, but _you cannot ever use this service securely from the client-side._ It
must always be called from a backend service.

## Uploading Files

Upload a file by `POST`ing it to the following endpoints with form multipart or JSON, with the key "file":

### /image

Uploads an image, and provides both the original image, and a URL allowing auto-cropping and resizing of the image.

```bash
curl -v -F file=@lizard.jpg http://localhost/image
```

Returns:

- **id:** a unique image ID, you can save this and use it to generate the URLs if desired
- **url:** url to the original-sized image
- **urlResize:** url for cropped images. (replace `{width}` and `{height}` or pass it into python's `.format()`.)

```json
{
  "id": "i/v/iv1rzfn5p2ox52rn7ad53ummpf76f6u14chy7at9toqs3nk5d8nidv5go3jr7g6zpx.jpg",
  "url": "https://img.codeday.org/o/i/v/iv1rzfn5p2ox52rn7ad53ummpf76f6u14chy7at9toqs3nk5d8nidv5go3jr7g6zpx.jpg",
  "urlResize": "https://img.codeday.org/{width}x{height}/i/v/iv1rzfn5p2ox52rn7ad53ummpf76f6u14chy7at9toqs3nk5d8nidv5go3jr7g6zpx.jpg"
}
```

### /video

Uploads a video, and provides both the original video, a thumbnail, and a m3u8 playlist of transcoded resolutions.

```sh
curl -v -F file=@watch-pigeons-to-sleep.mp4 http://localhost/video
```

Returns:
- **id:** a unique image ID, you can save this and use it to generate the video stream and thumbnail URLs later.
- **sourceId:"** a unique file ID, you can use this to generate the original download link later.
- **url:** url to the original file.
- **stream:** m3u8 playlist of transcoded versions of the original file.
- **image:** thumbnail image of the video.

```json
{
  "id": "lL2BQmDuOY6V1makJ8z021xp018px202Tjm",
  "sourceId": "5/x/5xs871bkgeapusoggimukovn1ety2vmhbdvj683xirparvijmett5s5enqwqbtqn27",
  "url": "https://uploads.codeday.org/5/x/5xs871bkgeapusoggimukovn1ety2vmhbdvj683xirparvijmett5s5enqwqbtqn27.mp4",
  "stream": "https://stream.mux.com/lL2BQmDuOY6V1makJ8z021xp018px202Tjm.m3u8",
  "image": "https://image.mux.com/lL2BQmDuOY6V1makJ8z021xp018px202Tjm/thumbnail.png"
}
```

### /

Uploads a generic file, and provides its URL.

```bash
curl -v -F file=@valve-handbook.pdf http://localhost/
```

Returns:
- **id:** a unique image ID, you can save this and use it to generate the file url later.
- **url:** url to the original file.

```json
{
  "id": "9/z/9zbhqgd9rxqko8h74hx27a3e7ws4rngnqmv9rsrzrndwqhoc5ukpgsiozcvs7ycers.pdf",
  "url": "https://uploads.codeday.org/9/z/9zbhqgd9rxqko8h74hx27a3e7ws4rngnqmv9rsrzrndwqhoc5ukpgsiozcvs7ycers.pdf"
}
```
