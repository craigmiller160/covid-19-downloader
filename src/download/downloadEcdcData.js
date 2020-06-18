const axios = require('axios');
const moment = require('moment');
const TraceError = require('trace-error');
const retry = require('retry');
const { attempt } = require('./retryUtil');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/';

const executeDownload = async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download ECDC data`);
    const res = await axios.get(url);
    if (res.data.map) {
        return res.data;
    }
    throw new Error('ECDC API did not return valid response, may be down.');
};

const attemptExecuteDownload = () => new Promise((resolve, reject) => {
    const operation = retry.operation();

    operation.attempt(async (currentAttempt) => {
        try {
            const data = await executeDownload(currentAttempt);
            resolve(data);
        } catch (ex) {
            if (operation.retry(ex)) {
                return;
            }
            reject(ex);
        }
    });
});

const downloadEcdcData = async () => {
    logger.info('Attempting to download ECDC data');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload, options);
        const newData = data.records.map((record) => ({
            date: moment(record.dateRep, 'DD/MM/YYYY').toDate(),
            newCases: parseInt(record.cases),
            newDeaths: parseInt(record.deaths),
            location: record.countriesAndTerritories,
            isState: false,
            population: record.popData2018 ? parseInt(record.popData2018) : null
        }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download ECDC data', ex);
    }
};

module.exports = downloadEcdcData;