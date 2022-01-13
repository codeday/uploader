if [[ -n $GOOGLE_KEY ]]; then
  echo "${GOOGLE_KEY}" > google.b64
  base64 -d google.b64 > /app/google.json
  rm google.b64
fi
node src/index.js
