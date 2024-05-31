#!/bin/sh

if [[ $1 = "minify" ]]; then
    tailwindcss-macos-arm64 -i input.css -o styles.css --minify
else
    tailwindcss-macos-arm64 -i input.css -o styles.css --watch
fi
