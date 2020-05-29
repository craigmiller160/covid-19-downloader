const axios = require('axios');
const moment = require('moment');
const TraceError = require('trace-error');

const covidProjectBaseUrl = 'https://covidtracking.com/api';
const stateHistoricalData = '/v1/states/daily.json';

const downloadCovidProjectData = async () => {
    console.log('Attempting to download The COVID Project data.');
    try {
        const res = await axios.get(`${covidProjectBaseUrl}${stateHistoricalData}`);
        const newData = res.data.map((record) => ({
            date: moment(record.date, 'YYYYMMDD').toDate(),
            newCases: record.positiveIncrease || 0,
            newDeaths: record.deathIncrease || 0,
            location: `${record.state}`,
            isState: true,
            population: null
        }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download The COVID Project data', ex);
    }
};

module.exports = downloadCovidProjectData;