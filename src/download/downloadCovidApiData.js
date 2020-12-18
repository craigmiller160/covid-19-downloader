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

const axios = require('axios');
const TraceError = require('trace-error');
const { logger } = require('@craigmiller160/covid-19-config-mongo');
const moment = require('moment');
const { attempt } = require('./retryUtil');

const BASE_URL = 'https://api.covid19api.com';
const COUNTRIES_URI = '/countries';
const COUNTRY_HISTORY_URI = '/dayone/country/';

const executeDownload = (url) => async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download COVID API data`);
    const res = await axios.get(url);
    if (res.data) {
        return res.data;
    }
    throw new Error('COVID API did not return a valid response, may be down');
};

const downloadCountryList = async () => {
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        return await attempt(executeDownload(`${BASE_URL}${COUNTRIES_URI}`), options);
    } catch (ex) {
        throw new TraceError('Unable to download COVID API country list', ex);
    }
};

const downloadCountryHistory = async (countryKey) => {
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload(`${BASE_URL}${COUNTRY_HISTORY_URI}${countryKey}`), options);
        let lastRecord = {
            newCases: 0,
            totalCases: 0,
            newDeaths: 0,
            totalDeaths: 0,
            location: '',
            date: null
        };
        return data.map((record) => {
            const newRecord = {
                date: moment(record.Date).toDate(),
                newCases: record.Confirmed - lastRecord.totalCases,
                totalCases: record.Confirmed,
                newDeaths: record.Deaths - lastRecord.totalDeaths,
                totalDeaths: record.Deaths,
                location: record.Country
            };
            lastRecord = newRecord;
            return newRecord;
        });
    } catch (ex) {
        throw new TraceError(`Unable to download COVID API country history data for ${countryKey}`, ex);
    }
}

module.exports = {
    downloadCountryList,
    downloadCountryHistory,
    BASE_URL,
    COUNTRIES_URI,
    COUNTRY_HISTORY_URI
};