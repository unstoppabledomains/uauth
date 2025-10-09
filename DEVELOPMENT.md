# Development

## Releasing

This project uses the new deferred versioning release workflow in conjunction with a github action. To release a new version of the package, follow the following steps:

For more info on deferred versioning check out the [Yarn Documentation](https://yarnpkg.com/features/release-workflow#deferred-versioning).

1. Create a branch using the branching system laid out in `uauth-service`.
2. Make changes...
3. Commit changes.
4. Run the `yarn version check --interactive` command to configure which versions you want to release.
5. To review your changes, look at the `.yarn/versions/<commit>.yml`. 
6. If you are satisfied with the versioning, run `yarn version apply --all`
7. Push the branch and make a PR into main.
8. Run the _Build, test, and release_ action on main.
