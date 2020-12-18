/*
 *     covid-19-downloader
 *     Copyright (C) 2020 Craig Miller
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
const { downloadCountryHistory, downloadCountryList } = require('./downloadCovidApiData');

const handleWorldDataOld = async () => { // TODO delete this
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
        return 'Successfully downloaded world data and inserted into MongoDB';
    } catch (ex) {
        throw new TraceError('Error downloading or inserting into MongoDB world data', ex);
    }
};

const handleWorldData = async () => {
    try {
        logger.info('Downloading world data');
        // TODO clear old data

        const countries = await downloadCountryList();
        // TODO iterate over countries, add country to list, download and write country history data

        // TODO need "current" data, done by combining latest records with population

        return 'Successfully downloaded world data and inserted into MongoDB';
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
        return 'Successfully downloaded state data and inserted into MongoDB';
    } catch (ex) {
        throw new TraceError('Error downloading or inserting into MongoDB state data', ex);
    }
};

const downloadDataToMongo = async () => {
    logger.info('Beginning download of all data to MongoDB');
    const results = await Promise.allSettled([handleWorldData(), handleStateData()]);
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            logger.info(result.value);
        } else {
            logger.error(result.reason);
        }
    });

    try {
        await setMetadata(new Date());
    } catch (ex) {
        throw new TraceError('Unable to update metadata after download', ex);
    }
};

module.exports = downloadDataToMongo;
