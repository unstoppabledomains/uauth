# yarn npm whoami

version=$(cat .version)

set -e

yarn set version latest

echo "Packages currently at version ($version)."
echo

while true; do
    read -p "What package version increment would you like? (major, minor, patch, premajor, preminor, prepatch, or prerelease): " version_increment
    case $version_increment in
    major)
        break
        ;;
    minor)
        break
        ;;
    patch)
        break
        ;;
    premajor)
        break
        ;;
    preminor)
        break
        ;;
    prepatch)
        break
        ;;
    prerelease)
        break
        ;;
    cancel) exit ;;
    *) echo "Please pick a valid version increment." ;;
    esac
done

new_version=$(yarn semver --increment $version_increment $version)

echo
echo "Incrementing version to ($new_version) for the following packages:"
echo
yarn workspaces foreach --since --topological-dev --no-private exec "cat package.json | jq .name"
echo

while true; do
    read -p "Are you sure you would like to publish these changes? (y/n): " yn
    case $yn in
    [Yy]*)
        break
        ;;
    [Nn]*)
        exit
        break
        ;;
    *) echo "Please pick a valid answer." ;;
    esac
done

echo "Checking for uncommitted changes..."
git diff-index --quiet HEAD

echo "Building packages..."
yarn build

echo "Incrementing package versions..."
yarn workspaces foreach --since --topological-dev --no-private version $new_version

echo "Tagging..."
git add -u
git tag $new_version -m "$new_version"

echo "Pushing..."
git push origin "$new_version"

# Replacing global package version inside of the .version file
echo $new_version >.version

echo "Publishing to npm..."
yarn workspaces foreach --since --topological-dev --no-private npm publish

echo
echo "Done!"
