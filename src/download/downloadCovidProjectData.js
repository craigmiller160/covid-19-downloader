const axios = require('axios');
const moment = require('moment');
const TraceError = require('trace-error');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const covidProjectBaseUrl = 'https://covidtracking.com/api';
const stateHistoricalData = '/v1/states/daily.json';

const downloadCovidProjectData = async () => {
    logger.info('Attempting to download The COVID Project data.');
    try {
        const res = await axios.get(`${covidProjectBaseUrl}${stateHistoricalData}`);
        const newData = res.data.map((record) => ({
            date: moment(record.date, 'YYYYMMDD').toDate(),
            newCases: record.positiveIncrease || 0,
            newDeaths: record.deathIncrease || 0,
            location: `${record.state}`,
            currentHospitalizations: record.hospitalizedCurrently,
            newTests: record.totalTestResultsIncrease,
            newPositivePercent: (record.positiveIncrease || 0) / record.totalTestResultsIncrease
        }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download The COVID Project data', ex);
    }
};

module.exports = downloadCovidProjectData;