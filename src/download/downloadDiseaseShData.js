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
const VACCINE_URI = '/vaccine/coverage';
const DISEASE_SH_DATE_FORMAT = 'M/D/YY';

const oldestDate = moment('2020-01-01');

const downloadCurrentDataAllCountries = async () => {
    logger.debug('Attempting to download Disease.sh data on current stats for all countries');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const res = await attempt(() => axios.get(`${BASE_URL}${COUNTRIES_CURRENT_URI}`), options);
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

const formatHistoricalData = (caseEntries, deathEntries, location, population) => {
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
                population,
                rawDate,
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

const addVaccineDataToRecord = (baseRecord, vaccineTimeline) => {
    const totalVaccines = vaccineTimeline[baseRecord.rawDate] || 0;
    const previousDate = moment(baseRecord.rawDate, DISEASE_SH_DATE_FORMAT)
        .subtract(1, 'days')
        .format(DISEASE_SH_DATE_FORMAT);
    const previousTotalVaccines = vaccineTimeline[previousDate] || 0;
    const newVaccines = totalVaccines - previousTotalVaccines;
    return {
        ...baseRecord,
        totalVaccines,
        newVaccines
    };
};

const downloadHistoricalDataWorld = async () => {
    logger.debug('Attempting to download Disease.sh data on world historical stats');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const lastDays = moment().diff(oldestDate, 'days');
        const historicalRes = await attempt(() => axios.get(`${BASE_URL}${HISTORICAL_URI}/all?lastdays=${lastDays}`), options);
        const vaccineRes = await attempt(() => axios.get(`${BASE_URL}${VACCINE_URI}?lastdays=${lastDays}`), options);

        const caseEntries = Object.entries(historicalRes.data.cases);
        const deathEntries = Object.entries(historicalRes.data.deaths);
        const worldHistoryData = formatHistoricalData(caseEntries, deathEntries, 'World');

        return worldHistoryData.map((record) => addVaccineDataToRecord(record, vaccineRes.data));
    } catch (ex) {
        throw new TraceError('Unable to download Disease.sh data on world historical stats', ex);
    }
};

const downloadHistoricalDataCountry = async (countryName, population) => {
    logger.debug(`Attempting to download Disease.sh data on historical stats for country ${countryName}`);
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const lastDays = moment().diff(oldestDate, 'days');
        const historicalRes = await attempt(() => axios.get(`${BASE_URL}${HISTORICAL_URI}/${countryName}?lastdays=${lastDays}`), options);
        const vaccineRes = await attempt(() => axios.get(`${BASE_URL}${VACCINE_URI}/countries/${countryName}?lastdays=${lastDays}`), options);

        const caseEntries = Object.entries(historicalRes.data.timeline.cases);
        const deathEntries = Object.entries(historicalRes.data.timeline.deaths);
        const countryHistoryData = formatHistoricalData(caseEntries, deathEntries, countryName, population);

        return countryHistoryData.map((record) => addVaccineDataToRecord(record, vaccineRes.data.timeline));
    } catch (ex) {
        if (ex.response.status === 404) {
            return [];
        }

        throw new TraceError(`Unable to download Disease.sh data on historical stats for country ${countryName}`, ex);
    }
};

module.exports = {
    downloadCurrentDataAllCountries,
    downloadHistoricalDataWorld,
    downloadHistoricalDataCountry,
    BASE_URL,
    COUNTRIES_CURRENT_URI,
    HISTORICAL_URI,
    VACCINE_URI
};
