#!/bin/bash

name=$(cat package.json | grep name | sed 's/^\s*"name":\s\?"//g' | sed 's/",$//g')
version=$(cat package.json | grep version | sed 's/^\s*"version":\s\?"//g' | sed 's/",$//g')

echo "Building $name:$version"

sudo docker build -t localhost:32000/$name:$version .