#!/usr/bin/env bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)

cd ..

echo "Installing Asciidoctor plugins"
gem install asciidoctor asciidoctor-html5s asciidoctor-rouge asciidoctor-diagram

echo "Updating to latest theme submodule"
git submodule update --init --recursive --remote

echo "Building Hugo website"
hugo $HUGO_ARGS

echo "Building service worker"
cd scripts && ./sw.sh
