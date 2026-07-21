#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <version>" >&2
  exit 2
fi

version=$1
tag="refs/tags/$version"
root=$(git rev-parse --show-toplevel)

cd "$root"

if [[ -n $(git status --porcelain) ]]; then
  echo 'Refusing to deploy from a dirty working tree.' >&2
  exit 1
fi

git fetch --prune --tags origin

if ! git rev-parse --verify --quiet "$tag^{commit}" >/dev/null; then
  echo "Release tag $version does not exist." >&2
  exit 1
fi

git checkout --detach "$tag"

sha=$(git rev-parse HEAD)
build_date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

BASS_VERSION="$version" \
BASS_BUILD_SHA="$sha" \
BASS_BUILD_DATE="$build_date" \
  docker compose up --detach --build --remove-orphans

docker compose ps
