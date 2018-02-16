#!/bin/sh
#
# Script that automates the release staging. The release staging creates
# a staging branch that creates a tagged pre-release for test during
# the day. Once the release has been tested for half a day,
# it can be release on the master branch through the release script.

set -e

function preparestaging {
  # Saves whatever is being worked on
  git stash

  # Check develop and get the latest changes
  git fetch origin
  git checkout develop
  git reset --hard origin/develop
  git branch -D staging || echo # Avoid failing on that command

  # Show changes in the last week and ack?
  echo -e '\nHere are the changes from the last 14 days:'
  git log --since=14.days
  read -p "Enter to continue"
  # Create a staging branch
  git checkout -b staging

  # Push to the staging branch and tag
  git push --set-upstream origin staging
}

echo "Starting the Cirrus weekly pre-release..."

# TODO Clone the repository in a temporary directory

# Go to cirrus dir
currentdir=`basename "$PWD"`
if [[ $currentdir -eq 'cirrus' ]]
then
  echo 'We are in Cirrus territory'
else
  echo 'Please run this script from the cirrus main repository directory'
  exit 1
fi

preparestaging

# TODO Check if the code has been built

# Upgrade the version
echo -e "\nThe current version of Cirrus is:"
npm version
echo "Would you like to create a premajor, preminor or prepatch prerelease?"
read release
npm version $release
git push && git push --tags

# Save the version for being imported into Cirrus Design
#cirrusversion=`npm version`

# Get back to the develop branch and the previous work
git stash pop || echo

# Go to cirrus-design - we just suppose they have the same parent
cd ../cirrus-design

preparestaging

# Wait for the new Cirrus prerelease to be published on NPM
#until npm install --save-dev cirrus@$cirrusversion; do echo "Try again in 1 minute" && sleep 1m; done
read -p "\nPress enter when the Cirrus package is available on NPM"
cirrusversion=`npm view @hybrid-cloud/cirrus version`

# Upgrade the version
read -p "Please upgrade the Cirrus version to ${cirrusversion} in src/views/includes/_global-nav.kit"
vi src/views/includes/_global-nav.kit
git add src/views/includes/_global-nav.kit
# Upgrade Cirrus in the dependencies as well
# npm update --save-dev @hybrid-cloud/cirrus # Doesn't work to update exactly the right version
read -p "Please upgrade the Cirrus version to ${cirrusversion} in package.json"
vi package.json
git add package.json
git commit -m "Updated the Cirrus version in the navigation and in the dependencies"

echo "The current version of Cirrus Design is:"
npm version
echo "Would you like to create a premajor, preminor or prepatch staging?"
read release
npm version $release
git push && git push --tags

# Done.
echo -e "\nCirrus Design should be ready for test in a few minutes on https://cirrus-design-dev.stage1.mybluemix.net is the build runs well."
