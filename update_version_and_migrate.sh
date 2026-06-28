#!/bin/bash

# Update version in main plugin file
sed -i 's/Version:           1.0.0/Version:           1.1.0/g' tubebay.php
sed -i "s/define('TUBEBAY_VERSION', '1.0.0');/define('TUBEBAY_VERSION', '1.1.0');/g" tubebay.php

# Update version in package.json
sed -i 's/"version": "1.0.0"/"version": "1.1.0"/g' package.json
