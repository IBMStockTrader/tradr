#!/bin/sh
#
# Script that automates the release from the staging branch.
# The release tags and updates the components, and prepare the staging branch
# so the pull requests to master can be executed.

set -e

function preparerelease {
  # Check develop and get the latest changes
  git fetch origin
  git checkout staging
  git reset --hard origin/staging

  # Show changes in the last week and ack?
  echo -e '\nHere are the changes from the last 14 days:'
  git log --since=14.days
  read -p "Enter to continue"
}

echo "Starting the Cirrus weekly release to master..."

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

preparerelease

# TODO Check if the code has been built

# Upgrade the version
echo -e "\nThe current version of Cirrus is:"
npm version
echo "Would you like to create a major, minor or patch release?"
read release
npm version $release
git push && git push --tags

# Save the version for being imported into Cirrus Design
#cirrusversion=`npm version`

# Get back to the develop branch and the previous work
# TODO Put this in a function
git checkout develop
git stash pop || echo

# Go to cirrus-design - we just suppose they have the same parent
cd ../cirrus-design

preparerelease

# Wait for the new Cirrus prerelease to be published on NPM
#until npm install --save-dev cirrus@$cirrusversion; do echo "Try again in 1 minute" && sleep 1m; done
read -p "\nPress enter when the Cirrus package is available on NPM"
cirrusversion=`npm view @hybrid-cloud/cirrus version`

# Upgrade the version
read -p "Please upgrade the Cirrus version in src/views/includes/_global-nav.kit"
vi src/views/includes/_global-nav.kit
git add src/views/includes/_global-nav.kit
# Upgrade Cirrus in the dependencies as well
read -p "Please upgrade the Cirrus version to ${cirrusversion} in package.json"
vi package.json
git add package.json
git commit -m "Updated the Cirrus version in the navigation and in the dependencies"

echo "The current version of Cirrus Design is:"
npm version
echo "Would you like to create a major, minor or patch release?"
read release
npm version $release
git push && git push --tags

# Get back to the develop branch and the previous work
git checkout develop
git stash pop || echo

echo -e "\nCreate two pull requests to master to merge both releases into their master branch."

echo "Ensure the next two weeks have milestones assigned, close the current milestone:"
echo "https://github.ibm.com/cloud-integration-design/cirrus/milestones"
echo -e "https://github.ibm.com/cloud-integration-design/cirrus-design/milestones"

echo -e "\nCreate releases in GitHub including their change log."

echo
echo "Congratulations, you're done with the current release!"

# TODO The release script should delete the staging branch at the end?
