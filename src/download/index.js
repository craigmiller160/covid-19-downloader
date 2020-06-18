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

const handleWorldData = async () => {
    try {
        logger.info('Downloading world data');
        const ecdcData = await downloadEcdcData();

        logger.info('Running calculations on world data');

        const countries = createCountryList(ecdcData.data);
        const countryHistoricalData = calculateDoubling(calculateHistoricalTotals(ecdcData.data));
        const worldHistoricalData = calculateDoubling(calculateHistoricalTotals(calculateWorldHistorical(countryHistoricalData)));
        const countryCurrentData = addCountryDisplayLocation(calculatePerMillion(calculateGrandTotal(countryHistoricalData)));

        logger.info('Writing world data to MongoDB');

        await setCountryCurrentData(countryCurrentData);
        await setCountryHistoricalData([...worldHistoricalData, ...countryHistoricalData]);
        await setCountryList(countries);
    } catch (ex) {
        throw new TraceError('Error downloading or inserting into MongoDB world data', ex);
    }
};

const handleStateData = async () => {
    try {
        logger.info('Downloading state data');
        const [covidProjData, censusData] = await Promise.all([
            downloadCovidProjectData(),
            downloadCensusData()
        ]);

        logger.info('Running calculations on state data');

        const states = createStateList(covidProjData.data);
        const stateHistoricalData = calculateDoubling(calculateHistoricalTotals(covidProjData.data));
        const stateCurrentData = addStateDisplayLocation(calculatePerMillion(combinePopulationData(calculateGrandTotal(stateHistoricalData), censusData.data)));

        logger.info('Writing state data to MongoDB');

        await setStateCurrentData(stateCurrentData);
        await setStateHistoricalData(stateHistoricalData);
        await setStateList(states);
    } catch (ex) {
        throw new TraceError('Error downloading or inserting into MongoDB state data', ex);
    }
};

const downloadDataToMongo = async () => {
    logger.info('Beginning download of all data to MongoDB');
    const results = await Promise.allSettled([handleWorldData(), handleStateData()]);
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            logger.info('Success'); // TODO need a better message
        } else {
            logger.error(result.reason);
        }
    });
};

module.exports = downloadDataToMongo;
