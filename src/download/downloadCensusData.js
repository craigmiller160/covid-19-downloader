const axios = require('axios');
const TraceError = require('trace-error');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://api.census.gov/data/2019/pep/population?for=state:*&get=POP,NAME';

const downloadCensusData = async () => {
    logger.info('Attempting to download US Census data');
    try {
        const res = await axios.get(url);
        const newData = res.data.slice(1)
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