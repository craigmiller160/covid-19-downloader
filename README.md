# covid-19-downloader

The downloader micro-service for the COVID 19 application. It pulls down the raw data and performs the calculations before storing the data in MongoDB.

## Config/MongoDB Library

This project depends on the @craigmiller160/covid-19-config-mongo library. It needs to be published locally in order to work.

### Setup with Verdaccio

When running on the main machine, Verdaccio is available. With this, it can be installed normally using the explicitly published version.

### Setup with Yalc

If Verdaccio is not available, you will need to build and publish the library using yalc.

## Deployment

1. Make sure to set the correct version in the package.json and deploy/deployment.yml file.
    1. A previously used version, even a beta one, cannot be re-used again.
2. Run `yarn build` to build the artifact.
3. Run the `kube-deploy` script to get it deployed to Kubernetes.