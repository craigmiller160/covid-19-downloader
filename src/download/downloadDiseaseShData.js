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
const { logger } = require('@craigmiller160/covid-19-config-mongo');
const { attempt } = require('./retryUtil');
const axios = require('axios');
const moment = require('moment');
const TraceError = require('trace-error');

const BASE_URL = 'https://corona.lmao.ninja/v3/covid-19';
const COUNTRIES_CURRENT_URI = '/countries';
const HISTORICAL_URI = '/historical';

const oldestDate = moment('2020-01-01');

const createExecuteDownload = (url) => async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download Disease.sh data`);
    const res = await axios.get(url);
    if (res.data) {
        return res.data;
    }
    throw new Error('Disease.sh API did not return a valid response, may be down.');
};

const downloadCurrentDataAllCountries = async () => {
    logger.info('Attempting to download Disease.sh data on current stats for all countries');
    try {
        const data = await attempt(createExecuteDownload(`${BASE_URL}${COUNTRIES_CURRENT_URI}`));
        return data.map((record) => ({
            location: record.country,
            displayLocation: record.country,
            population: record.population,
            totalCases: record.cases,
            totalCasesPerMillion: record.casesPerOneMillion,
            totalDeaths: record.deaths,
            totalDeathsPerMillion: record.deathsPerOneMillion
        }));
    } catch (ex) {
        throw new TraceError('Unable to download Disease.sh data on current stats for all countries', ex);
    }
};

const downloadHistoricalDataWorld = async () => {
    logger.info('Attempting to download Disease.sh data on world historical stats');
    try {
        const lastDays = oldestDate.diff(moment(), 'days');
        const data = await attempt(createExecuteDownload(`${BASE_URL}${HISTORICAL_URI}/all?lastdays=${lastDays}`));
        let lastRecord = {
            date: null,
            location: null,
            newCases: 0,
            newDeaths: 0,
            totalCases: 0,
            totalDeaths: 0
        };
        // TODO format the data
    } catch (ex) {
        throw new TraceError('Unable to download Disease.sh data on world historical stats', ex);
    }
};

const downloadHistoricalDataCountry = async (countryName) => {
    // TODO finish this
};

module.exports = {
    downloadCurrentDataAllCountries,
    downloadHistoricalDataWorld,
    downloadHistoricalDataCountry,
    BASE_URL,
    COUNTRIES_CURRENT_URI,
    HISTORICAL_URI
};