const downloadEcdcData = require('./downloadEcdcData');
const downloadCovidProjectData = require('./downloadCovidProjectData');
const downloadCensusData = require('./downloadCensusData');
const {
    calculateHistoricalTotals,
    calculateWorldHistorical,
    calculateDoubling,
    calculateGrandTotal,
    calculatePerMillion,
    createCountryList,
    createStateList,
    combinePopulationData,
    addCountryDisplayLocation,
    addStateDisplayLocation
} = require('./calculateMoreData');
const path = require('path');
const TraceError = require('trace-error');
const { setCountryCurrentData } = require('../service/CountryCurrentService')
const { setCountryHistoricalData } = require('../service/CountryHistoricalService');
const { setCountryList } = require('../service/CountryListService');
const { setStateCurrentData } = require('../service/StateCurrentService');
const { setStateHistoricalData } = require('../service/StateHistoricalService');
const { setStateList } = require('../service/StateListService');
const { setMetadata } = require('../service/MetadataService');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const downloadDataToMongo = async () => {
    logger.info('Beginning download of all data to MongoDB');
    try {
        const [ecdcData, covidProjData, censusData] = await Promise.all([
            downloadEcdcData(),
            downloadCovidProjectData(),
            downloadCensusData()
        ]);

        logger.info('Running calculations on data');

        const countries = createCountryList(ecdcData.data);
        const states = createStateList(covidProjData.data);

        const countryHistoricalData = calculateDoubling(calculateHistoricalTotals(ecdcData.data));
        const stateHistoricalData = calculateDoubling(calculateHistoricalTotals(covidProjData.data));
        const worldHistoricalData = calculateDoubling(calculateHistoricalTotals(calculateWorldHistorical(countryHistoricalData)));
        const countryCurrentData = addCountryDisplayLocation(calculatePerMillion(calculateGrandTotal(countryHistoricalData)));
        const stateCurrentData = addStateDisplayLocation(calculatePerMillion(combinePopulationData(calculateGrandTotal(stateHistoricalData), censusData.data)));

        logger.info('Writing data to MongoDB');
        await setCountryCurrentData(countryCurrentData);
        await setCountryHistoricalData([...worldHistoricalData, ...countryHistoricalData]);
        await setCountryList(countries);
        await setStateCurrentData(stateCurrentData);
        await setStateHistoricalData(stateHistoricalData);
        await setStateList(states);
        await setMetadata(new Date());
        logger.info('All data written to MongoDB');
    } catch (ex) {
        throw new TraceError('Error downloading data and/or inserting into MongoDB', ex);
    }
};

module.exports = downloadDataToMongo;
