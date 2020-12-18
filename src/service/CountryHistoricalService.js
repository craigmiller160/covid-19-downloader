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

const { connect } = require('@craigmiller160/covid-19-config-mongo');
const TraceError = require('trace-error');
const moment = require('moment');

const COLLECTION = 'country_history';

const setCountryHistoricalData = async (countryData) => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .insertMany(countryData);
        });
    } catch (ex) {
        throw new TraceError('Error setting historical country data', ex);
    }
};

const clearCountryHistoricalData = async () => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
        });
    } catch (ex) {
        throw new TraceError('Error clearing historical country data', ex);
    }
};

module.exports = {
    setCountryHistoricalData,
    clearCountryHistoricalData,
    COLLECTION
};