#!/bin/bash
set -e
cd "$(dirname "$0")"

export WEBKIT_DISABLE_DMABUF_RENDERER=1
export WEBKIT_DISABLE_COMPOSITING_MODE=1

./ui/node_modules/.bin/neu run 
./ui/node_modules/.bin/neu run "--" --window-enable-inspector
