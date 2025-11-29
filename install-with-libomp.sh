#!/bin/bash
# Script to install Flowise dependencies with libomp support

export LDFLAGS="-L/usr/local/opt/libomp/lib"
export CPPFLAGS="-I/usr/local/opt/libomp/include"
export PKG_CONFIG_PATH="/usr/local/opt/libomp/lib/pkgconfig:$PKG_CONFIG_PATH"

echo "Installing Flowise dependencies with OpenMP support..."
echo "LDFLAGS: $LDFLAGS"
echo "CPPFLAGS: $CPPFLAGS"

pnpm install

