#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <api-base-url> <bearer-token> <image-path>"
  echo "Example: $0 http://localhost:8976 eyJhbGciOi... /tmp/arabic-sample.jpg"
  exit 1
fi

API_BASE_URL="$1"
BEARER_TOKEN="$2"
IMAGE_PATH="$3"

if [[ ! -f "${IMAGE_PATH}" ]]; then
  echo "Image file not found: ${IMAGE_PATH}"
  exit 1
fi

curl --fail --silent --show-error \
  -X POST "${API_BASE_URL%/}/api/Ocr/ocr" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -F "Images=@${IMAGE_PATH}"

echo
