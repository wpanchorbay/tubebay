#!/bin/bash

# Define the zip filename
ZIP_NAME="tubebay.zip"
PLUGIN_SLUG="tubebay"

# Cleanup previous build if exists
rm -rf dist
rm -f $ZIP_NAME

# Helper function to copy plugin files to a target path
copy_plugin_files() {
    local DEST=$1
    echo "Copying files to $DEST..."

    # Copy folders
    cp -r app "$DEST/"
    cp -r assets "$DEST/"
    cp -r build "$DEST/"
    cp -r config "$DEST/"
    cp -r languages "$DEST/"
    cp -r vendor "$DEST/"

    # Copy files
    cp index.php "$DEST/"
    cp readme.txt "$DEST/"
    cp uninstall.php "$DEST/"
    cp tubebay.php "$DEST/"
    cp composer.json "$DEST/"

    # Source maps are build-time debugging aids, never runtime assets. Stale
    # ones from an old `npm start` had been riding along in build/ and made up
    # roughly half the shipped payload (settings.js.map alone was 640K), while
    # also publishing the unminified sources. Stripped here rather than trusted
    # to be absent, so a dev build before packaging can never leak them again.
    find "$DEST" -name '*.map' -type f -delete
}

# Create a temporary directory for staging
mkdir -p dist/$PLUGIN_SLUG
copy_plugin_files "dist/$PLUGIN_SLUG"

# Create the zip file.
# Files sit at the ZIP ROOT -- no top-level <slug>/ wrapper directory.
echo "Creating zip file..."
cd dist/$PLUGIN_SLUG
zip -rq ../../$ZIP_NAME .
cd ../..
rm -rf dist/$PLUGIN_SLUG

# dist/svn/trunk mirrors the real WordPress.org SVN layout (trunk/ IS the
# plugin root, no plugin-slug wrapper) -- rsync straight into an svn working
# copy's trunk/ for `svn commit`. Left as a plain folder on purpose (not
# zipped, not removed after) since that's how svn expects it.
mkdir -p dist/svn/trunk
copy_plugin_files "dist/svn/trunk"

echo "Done! Created $ZIP_NAME containing:"
echo "- app/"
echo "- languages/"
echo "- assets/"
echo "- build/"
echo "- index.php"
echo "- readme.txt"
echo "- uninstall.php"
echo "- tubebay.php"
echo ""
echo "Also created dist/svn/trunk/ (uncompressed, ready for \`svn commit\` into a checkout's trunk/)"
