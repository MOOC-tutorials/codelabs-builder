#!/bin/bash

if [ ! -f ~/codelabs/claat ]; then
    echo "Downloading claat..."
    curl -Lo ~/codelabs/claat https://cdn.glitch.com/58771009-7272-47a3-add3-5c035d93c51f%2Fclaat?v=1571329538657
    chmod +x ~/codelabs/claat
fi

node server.js