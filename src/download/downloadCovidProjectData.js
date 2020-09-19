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
const { attempt } = require('./retryUtil');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://covidtracking.com/api/v1/states/daily.json';

const executeDownload = async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download The COVID Project data`);
    const res = await axios.get(url);
    if (res.data.map) {
        return res.data;
    }
    throw new Error('The COVID Project API did not return a valid response, may be down.');
};

const downloadCovidProjectData = async () => {
    logger.info('Attempting to download The COVID Project data.');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload, options);
        const newData = data.map((record) => ({
            date: moment(record.date, 'YYYYMMDD').toDate(),
            newCases: record.positiveIncrease || 0,
            newDeaths: record.deathIncrease || 0,
            location: `${record.state}`,
            newTests: record.totalTestResultsIncrease,
            newPositivePercent: ((record.positiveIncrease || 0) / record.totalTestResultsIncrease) * 100,
            newHospitalized: record.hospitalizedIncrease
        }));

        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download The COVID Project data', ex);
    }
};

module.exports = downloadCovidProjectData;
