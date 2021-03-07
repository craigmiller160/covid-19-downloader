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
const { calculateRangeData } = require('./calculateRangeData');
const {
    downloadCurrentDataAllCountries,
    downloadHistoricalDataCountry,
    downloadHistoricalDataWorld
} = require('./downloadDiseaseShData');

const handleWorldData = async () => {
    try {
        logger.info('Downloading world data');

        const countryCurrentData = await downloadCurrentDataAllCountries();
        const countryList = countryCurrentData.map((country) => ({
            location: country.location,
            displayLocation: country.displayLocation,
            population: country.population
        }));
        const worldHistoricalData = await downloadHistoricalDataWorld();
        const countryHistoryPromises = countryList.map((country) => downloadHistoricalDataCountry(country.location, country.population));
        const countryHistories = await Promise.all(countryHistoryPromises);
        const countryRangeData = countryHistories.map((countryData) => calculateRangeData(countryData));

        logger.info('Writing world data to MongoDB');

        await setCountryList(countryList);
        await setCountryCurrentData(countryCurrentData);
        const combinedCountryHistoryData = [ worldHistoricalData, ...countryHistories ]
            .filter((countryData) => countryData.length > 0);
        await setCountryHistoricalData(combinedCountryHistoryData);
        // TODO need to save country range data

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
        logger.info('Setting metadata');
        await setMetadata(new Date());
        logger.info('Data download complete');
    } catch (ex) {
        throw new TraceError('Unable to update metadata after download', ex);
    }
};

module.exports = downloadDataToMongo;
