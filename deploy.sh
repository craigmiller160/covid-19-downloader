#!/bin/bash

name=$(cat package.json | grep name | sed 's/^\s*"name":\s\?"//g' | sed 's/",$//g' | sed 's/\@craigmiller160\///g')
version=$(cat package.json | grep version | sed 's/^\s*"version":\s\?"//g' | sed 's/",$//g')
registry=localhost:32000
tag=$registry/$name:$version

check_artifact_version() {
  artifact_version=$(ls deploy/build | grep zip | sed 's/\.zip$//g' | sed "s/^$name-//g")
  if [ $version != $artifact_version ]; then
    echo "Project version $version does not equal artifact version $artifact_version"
    exit 1
  fi
}

check_deployment_version() {
  deployment_version=$(cat deploy/deployment.yml | grep $registry | sed "s/^.*$registry\/$name://g")
  if [ $version != $deployment_version ]; then
    echo "Project version $version does not equal deployment.yml version $deployment_version"
    exit 1
  fi
}

build() {
  echo "Building $name:$version"

  cd deploy
  sudo docker build \
    --network=host \
    -t $tag \
    .
  sudo docker push $tag

  sudo microk8s kubectl apply -f configmap.yml
  sudo microk8s kubectl apply -f deployment.yml
  sudo microk8s kubectl rollout restart deployment $name
}

check_artifact_version
check_deployment_version
build