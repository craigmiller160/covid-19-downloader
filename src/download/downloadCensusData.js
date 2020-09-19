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
const { attempt } = require('./retryUtil');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const url = 'https://api.census.gov/data/2019/pep/population?for=state:*&get=POP,NAME';

const executeDownload = async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download US Census data`);
    const res = await axios.get(url);
    if (res.data.map) {
        return res.data;
    }
    throw new Error('US Census API did not return a valid response');
};

const downloadCensusData = async () => {
    logger.info('Attempting to download US Census data');
    try {
        const options = {
            retries: process.env.DOWNLOAD_RETRY_ATTEMPTS,
            minTimeout: process.env.DOWNLOAD_RETRY_WAIT
        };
        const data = await attempt(executeDownload, options);
        const newData = data.slice(1)
            .map((record) => ({
                population: record[0] ? parseInt(record[0]) : null,
                displayLocation: record[1]
            }));
        return {
            data: newData
        };
    } catch (ex) {
        throw new TraceError('Unable to download US Census data", ex);')
    }
};

module.exports = downloadCensusData;