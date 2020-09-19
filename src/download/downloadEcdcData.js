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
const moment = require('moment');
const TraceError = require('trace-error');
const retry = require('retry');
const { attempt } = require('./retryUtil');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/';

const executeDownload = async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download ECDC data`);
    const res = await axios.get(url);
    if (res.data.records) {
        return res.data;
    }
    throw new Error('ECDC API did not return a valid response, may be down.');
};

const downloadEcdcData = async () => {
    logger.info('Attempting to download ECDC data');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload, options);
        const newData = data.records.map((record) => ({
            date: moment(record.dateRep, 'DD/MM/YYYY').toDate(),
            newCases: parseInt(record.cases),
            newDeaths: parseInt(record.deaths),
            location: record.countriesAndTerritories,
            isState: false,
            population: record.popData2019 ? parseInt(record.popData2019) : null
        }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download ECDC data', ex);
    }
};

module.exports = downloadEcdcData;
