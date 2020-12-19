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

const downloadCurrentDataAllCountries = async () => {
    logger.info('Attempting to download Disease.sh data on current stats for all countries');
    try {
        const res = await axios.get(`${BASE_URL}${COUNTRIES_CURRENT_URI}`);
        return res.data.map((record) => ({
            location: record.countryInfo.iso3,
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

const formatHistoricalData = (caseEntries, deathEntries, location) => {
    let lastRecord = {
        date: null,
        location: null,
        newCases: 0,
        newDeaths: 0,
        totalCases: 0,
        totalDeaths: 0
    };

    return [...new Array(caseEntries.length).keys()]
        .map((index) => {
            const rawDate = caseEntries[index][0];
            const totalCases = caseEntries[index][1];
            const totalDeaths = deathEntries[index][1];
            const newRecord = {
                location,
                date: moment(rawDate, 'M/DD/YY').toDate(),
                newCases: totalCases - lastRecord.totalCases,
                totalCases,
                newDeaths: totalDeaths - lastRecord.totalDeaths,
                totalDeaths
            };
            lastRecord = newRecord;

            return newRecord;
        });
};

const downloadHistoricalDataWorld = async () => {
    logger.info('Attempting to download Disease.sh data on world historical stats');
    try {
        const lastDays = moment().diff(oldestDate, 'days');
        const res = await axios.get(`${BASE_URL}${HISTORICAL_URI}/all?lastdays=${lastDays}`);

        const caseEntries = Object.entries(res.data.cases);
        const deathEntries = Object.entries(res.data.deaths);
        return formatHistoricalData(caseEntries, deathEntries, 'World');
    } catch (ex) {
        throw new TraceError('Unable to download Disease.sh data on world historical stats', ex);
    }
};

const downloadHistoricalDataCountry = async (countryName) => {
    logger.info(`Attempting to download Disease.sh data on historical stats for country ${countryName}`);
    try {
        const lastDays = moment().diff(oldestDate, 'days');
        const res = await axios.get(`${BASE_URL}${HISTORICAL_URI}/${countryName}?lastdays=${lastDays}`);

        // TODO validate 404

        const caseEntries = Object.entries(res.data.timeline.cases);
        const deathEntries = Object.entries(res.data.timeline.deaths);
        return formatHistoricalData(caseEntries, deathEntries, countryName);
    } catch (ex) {
        throw new TraceError(`Unable to download Disease.sh data on historical stats for country ${countryName}`, ex);
    }
};

module.exports = {
    downloadCurrentDataAllCountries,
    downloadHistoricalDataWorld,
    downloadHistoricalDataCountry,
    BASE_URL,
    COUNTRIES_CURRENT_URI,
    HISTORICAL_URI
};