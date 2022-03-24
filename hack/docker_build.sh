#!/usr/bin/env bash

set -ex
set -o pipefail

TAG=${TAG:-latest}
REPO=${REPO:-kubespheredev}
REGISTRY=${REGISTRY:-}
PUSH=${PUSH:-}

# support other container tools. e.g. podman
CONTAINER_CLI=${CONTAINER_CLI:-docker}
CONTAINER_BUILDER=${CONTAINER_BUILDER:-"build"}

# shellcheck disable=SC2086 # inteneded splitting of CONTAINER_BUILDER
${CONTAINER_CLI} ${CONTAINER_BUILDER} \
  -f build/Dockerfile \
  -t "${REGISTRY}/${REPO}"/ks-console:"${TAG}" .

# If set, just building, no pushing
if [[ -z "${DRY_RUN:-}" ]]; then
  ${CONTAINER_CLI} push "${REGISTRY}/${REPO}"/ks-console-replace:"${TAG}"
fi



