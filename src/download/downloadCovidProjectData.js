const axios = require('axios');
const moment = require('moment');
const TraceError = require('trace-error');
const { attempt } = require('./retryUtil');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://covidtracking.com/api/v1/states/daily.json';

const executeDownload = async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download The COVID Project data`);
    const res = await axios.get(url);
    if (res.data.map) {
        return res.data;
    }
    throw new Error('The COVID Project API did not return a valid response, may be down.');
};

const downloadCovidProjectData = async () => {
    logger.info('Attempting to download The COVID Project data.');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload, options);
        const newData = data.map((record) => ({
            date: moment(record.date, 'YYYYMMDD').toDate(),
            newCases: record.positiveIncrease || 0,
            newDeaths: record.deathIncrease || 0,
            location: `${record.state}`,
            currentHospitalizations: record.hospitalizedCurrently,
            newTests: record.totalTestResultsIncrease,
            newPositivePercent: ((record.positiveIncrease || 0) / record.totalTestResultsIncrease) * 100
        }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download The COVID Project data', ex);
    }
};

module.exports = downloadCovidProjectData;