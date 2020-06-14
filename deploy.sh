#!/bin/bash

name=$(cat package.json | grep name | sed 's/"name":\s\?"//g' | sed 's/",$//g')
version=$(cat package.json | grep version | sed 's/"version":\s\?"//g' | sed 's/",$//g')

sudo docker build -t "localhost:32000/$name:v$version"