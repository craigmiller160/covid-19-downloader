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
const retry = require('retry');

const createExecuteDownload = (url) => async (currentAttempt) => {
    logger.debug(`Attempt #${currentAttempt} to download Disease.sh data`);
    const res = await axios.get(url);
    if (res.data) {
        return res.data;
    }
    throw new Error('Disease.sh API did not return a valid response, may be down.');
};

const downloadCurrentDataAllCountries = async () => {
    // TODO finish this
};

const downloadHistoricalDataWorld = async () => {
    // TODO finish this
};

const downloadHistoricalDataCountry = async (countryName) => {
    // TODO finish this
};

module.exports = {
    downloadCurrentDataAllCountries,
    downloadHistoricalDataWorld,
    downloadHistoricalDataCountry
};