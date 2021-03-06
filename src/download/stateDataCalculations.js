/*
 *     covid-19-downloader
 *     Copyright (C) 2021 Craig Miller
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
const states = require('../utils/states');

const addPopulationData = (stateHistoricalData, censusData) => {
    return stateHistoricalData.map((record) => {
        const displayLocation = states[record.location];
        const match = censusData.find((popRecord) => popRecord.displayLocation === displayLocation);
        return {
            ...record,
            population: match?.population
        };
    });
};

const splitStateData = (stateHistoricalData) => {
    const separatedData = stateHistoricalData.reduce((acc, record) => {
        return {
            ...acc,
            [record.location]: [
                ...(acc[record.location] || []),
                record
            ]
        };
    }, {});
    return Object.values(separatedData);
};

module.exports = {
    addPopulationData,
    splitStateData
};