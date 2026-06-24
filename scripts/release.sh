#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Make sure we are at repository root
cd "$(dirname "$0")/.."

# Check if git workspace is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Warning: You have uncommitted changes in your git repository."
    read -p "Do you want to continue anyway? [y/N] " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Allow version/tag to be passed as a command-line argument
VERSION_ARG="$1"
VERSION=""

if [ -n "$VERSION_ARG" ]; then
    VERSION="$VERSION_ARG"
else
    # Automatically extract the latest version from CHANGELOG.md (handling [vX.Y.Z] format)
    LATEST_VERSION=$(grep -E '^##[[:space:]]*\[?v?[0-9]+\.[0-9]+\.[0-9]+' CHANGELOG.md | head -n 1 | sed -E 's/^##[[:space:]]*\[?v?([0-9]+\.[0-9]+\.[0-9]+).*$/\1/')

    if [ -z "$LATEST_VERSION" ]; then
        echo "❌ Error: Could not find any version header (e.g., '## [v3.0.0]') in CHANGELOG.md."
        read -p "Enter version manually (e.g., 3.0.0): " LATEST_VERSION
    fi

    # Ask for version confirmation
    read -p "Confirm release version [default: $LATEST_VERSION]: " user_version
    VERSION=${user_version:-$LATEST_VERSION}
fi

# Standardize tag name with 'v' prefix
if [[ ! "$VERSION" =~ ^v ]]; then
    TAG="v$VERSION"
else
    TAG="$VERSION"
fi

echo "🚀 Preparing release for tag: $TAG..."

# Check if tag already exists locally
if git show-ref --tags --quiet --verify "refs/tags/$TAG"; then
    echo "ℹ️ Local tag '$TAG' already exists."
    read -p "Recreate it locally? [y/N] " recreate_local
    if [[ "$recreate_local" =~ ^[Yy]$ ]]; then
        git tag -d "$TAG"
    else
        echo "Aborted."
        exit 0
    fi
fi

# Attempt to delete remote tag just in case (to overwrite it)
echo "Checking remote tag..."
if git ls-remote --tags origin | grep -q "refs/tags/$TAG"; then
    echo "⚠️ Remote tag '$TAG' already exists."
    read -p "Delete and recreate the remote tag? [y/N] " recreate_remote
    if [[ "$recreate_remote" =~ ^[Yy]$ ]]; then
        echo "Deleting remote tag '$TAG'..."
        git push origin --delete "$TAG" || true
    else
        echo "Aborted."
        exit 0
    fi
fi

# Ensure latest commits are pushed first
CURRENT_BRANCH=$(git branch --show-current)
echo "Pushing latest commits on branch '$CURRENT_BRANCH' to origin..."
git push origin "$CURRENT_BRANCH"

# Create new tag
echo "Creating tag '$TAG'..."
git tag -a "$TAG" -m "Release $TAG"

# Push tag
echo "Pushing tag '$TAG' to origin..."
git push origin "$TAG"

echo "🎉 Successfully published tag '$TAG'! GitHub Actions will now trigger the Release creation."
