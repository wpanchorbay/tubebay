#!/bin/bash
#
# Sync dist/svn/trunk/ into a WordPress.org SVN working copy and cut the tag.
#
# package.sh builds dist/svn/trunk/ but cannot touch SVN. Copying those files
# by hand is where releases go wrong in two specific ways:
#
#   1. New files are copied but never `svn add`ed, so they are absent from the
#      commit. 1.3.2 adds 13 files over 1.2.0 (the blocks, their build output,
#      BlockManager, Upgrader) -- miss them and the published plugin has no
#      blocks at all.
#   2. Files dropped since the last release stay behind. 1.2.0 shipped
#      build/settings.js.map and build/settings.css.map; the 1.3.2 changelog
#      says source maps were removed. Leave them in trunk and that line is
#      false for the tag people actually download.
#
# So this script diffs rather than copies: rsync --delete makes trunk match the
# payload exactly, then every unversioned path is added and every missing path
# is removed, before the tag is cut from trunk.
#
# Usage:
#   ./release-svn.sh /path/to/svn/checkout           # dry run, changes nothing
#   ./release-svn.sh /path/to/svn/checkout --commit  # stage, tag and commit
#
# Get a checkout first if you do not have one:
#   svn co https://plugins.svn.wordpress.org/tubebay/ ~/svn/tubebay

set -e

SVN_ROOT="$1"
DO_COMMIT="$2"
SRC="$(cd "$(dirname "$0")" && pwd)/dist/svn/trunk"

if [ -z "$SVN_ROOT" ]; then
    echo "Usage: $0 /path/to/svn/checkout [--commit]" >&2
    exit 1
fi

if [ ! -d "$SRC" ]; then
    echo "ERROR: $SRC does not exist. Run ./build.sh <version> && ./package.sh first." >&2
    exit 1
fi

if [ ! -d "$SVN_ROOT/.svn" ]; then
    echo "ERROR: $SVN_ROOT is not an SVN working copy (no .svn directory)." >&2
    echo "       svn co https://plugins.svn.wordpress.org/tubebay/ $SVN_ROOT" >&2
    exit 1
fi

VERSION=$(grep -oP "(?<=^Stable tag: ).*" "$SRC/readme.txt" | tr -d '[:space:]')
if [ -z "$VERSION" ]; then
    echo "ERROR: could not read Stable tag from $SRC/readme.txt" >&2
    exit 1
fi

# The plugin header and the readme must agree, or .org serves a version that
# does not match the code inside it.
HEADER_VERSION=$(grep -oP "(?<=Version:\s{11}).*" "$SRC/tubebay.php" | tr -d '[:space:]' | head -1)
if [ "$VERSION" != "$HEADER_VERSION" ]; then
    echo "ERROR: readme Stable tag ($VERSION) != plugin header Version ($HEADER_VERSION)." >&2
    exit 1
fi

echo "Releasing $VERSION"
echo "  from: $SRC"
echo "  into: $SVN_ROOT"
echo

if [ -d "$SVN_ROOT/tags/$VERSION" ]; then
    echo "ERROR: tags/$VERSION already exists. A published tag must never be rewritten." >&2
    exit 1
fi

mkdir -p "$SVN_ROOT/trunk"

# --delete is the point: trunk must end up identical to the payload, not merely
# contain it. .svn is excluded so rsync cannot destroy the working copy itself.
echo "== Syncing trunk (rsync --delete) =="
rsync -a --delete --exclude '.svn' "$SRC/" "$SVN_ROOT/trunk/"

cd "$SVN_ROOT"

# svn status: '?' is on disk but unversioned, '!' is versioned but gone.
ADDS=$(svn status trunk | grep '^?' | sed 's/^?[[:space:]]*//' || true)
DELS=$(svn status trunk | grep '^!' | sed 's/^![[:space:]]*//' || true)

echo
echo "== New files to svn add ($(echo "$ADDS" | grep -c . || true)) =="
echo "$ADDS" | sed 's/^/  + /' | grep . || echo "  (none)"
echo
echo "== Removed files to svn rm ($(echo "$DELS" | grep -c . || true)) =="
echo "$DELS" | sed 's/^/  - /' | grep . || echo "  (none)"
echo
echo "== Modified =="
svn status trunk | grep '^M' | sed 's/^/  /' || echo "  (none)"

if [ "$DO_COMMIT" != "--commit" ]; then
    echo
    echo "Dry run. Nothing was staged, tagged or committed."
    echo "Re-run with --commit to apply:"
    echo "  $0 $SVN_ROOT --commit"
    exit 0
fi

echo
echo "== Staging =="
[ -n "$ADDS" ] && echo "$ADDS" | xargs -r svn add --parents
[ -n "$DELS" ] && echo "$DELS" | xargs -r svn rm

# The tag is copied from the working copy and committed in the SAME revision as
# trunk. Committing trunk first would publish a readme whose Stable tag points
# at a tag that does not exist yet, and .org would serve that gap to every site
# checking for updates.
echo "== Copying trunk to tags/$VERSION =="
# The real plugins.svn.wordpress.org repo always has tags/, but a fresh or
# hand-made checkout may not -- and a plain mkdir leaves it unversioned, which
# makes `svn cp` fail with E155010 after the adds are already staged.
TAG_TARGET="tags/$VERSION"
if ! svn info tags >/dev/null 2>&1; then
    mkdir -p tags
    svn add --parents tags
    # tags/ itself is new, so it has to be in the commit target list -- SVN
    # refuses a commit whose child is included but whose unversioned parent
    # is not (E200009).
    TAG_TARGET="tags"
fi
svn cp trunk "tags/$VERSION"

echo "== Committing trunk and tags/$VERSION together =="
svn ci -m "Release $VERSION" trunk "$TAG_TARGET"

echo
echo "Done. Released $VERSION."
echo "Check https://wordpress.org/plugins/tubebay/ once .org has rebuilt (a few minutes)."
