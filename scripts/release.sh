#!/usr/bin/env bash

dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

set -e

VERSION_JSON=$(yarn version apply --json)

if [ -n "$VERSION_JSON" ]; then
  VERSION=$(node -e "console.log(($VERSION_JSON).newVersion)")
  PKG_NAME=$(node -e "console.log(($VERSION_JSON).ident)")

  git add package.json $dir/../.yarn/versions
  git commit -m "$PKG_NAME@$VERSION"
  git tag "$PKG_NAME@$VERSION"

  [[ "$GITHUB_HEAD_REF" == 'release' ]] && TAG=latest || TAG=next

  yarn npm publish --tolerate-republish --tag $TAG

  git push --tags
fi
