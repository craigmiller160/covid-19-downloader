# covid-19-downloader

The downloader micro-service for the COVID 19 application. It pulls down the raw data and performs the calculations before storing the data in MongoDB.

## Config/MongoDB Library

This project depends on the @craigmiller160/covid-19-config-mongo library. It needs to be published locally in order to work.

Once it is published locally, make sure to add it and refresh the dependencies.

```
yalc add @craigmiller160/covid-19-config-mongo
yarn
```