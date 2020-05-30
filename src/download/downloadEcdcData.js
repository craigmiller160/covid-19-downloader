const axios = require('axios');
const moment = require('moment');
const TraceError = require('trace-error');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/';

const downloadEcdcData = async () => {
    logger.info('Attempting to download ECDC data');
    try {
        const res = await axios.get(url);
        const newData = res.data.records.map((record) => ({
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