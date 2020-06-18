const axios = require('axios');
const TraceError = require('trace-error');
const { attempt } = require('./retryUtil');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://api.census.gov/data/2019/pep/population?for=state:*&get=POP,NAME';

const executeDownload = async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download US Census data`);
    const res = await axios.get(url);
    if (res.data.map) {
        return res.data;
    }
    throw new Error('US Census API did not return a valid response');
};

const downloadCensusData = async () => {
    logger.info('Attempting to download US Census data');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload, options);
        const newData = data.slice(1)
            .map((record) => ({
                population: record[0] ? parseInt(record[0]) : null,
                displayLocation: record[1]
            }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download US Census data", ex);')
    }
};

module.exports = downloadCensusData;