cd ./dist/ikusa-logger/ || echo "[ERROR]: Missing DIST. Did you build the project?"
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_FORCE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_PARTIALS=1
./ikusa-logger-linux_x64
