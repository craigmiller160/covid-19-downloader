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

const { WORLD_LOCATION } = require('../utils/globalConstants');
const { rangeUntil } = require('../utils/range');
const moment = require('moment');
const states = require('../utils/states');

const emptyEntry = {
    newCases: 0,
    newDeaths: 0,
    totalCases: 0,
    totalDeaths: 0
};

const calculateHistoricalTotals = (data) => {
    const dataByLocation = data.slice()
        .reverse()
        .reduce((acc, entry) => {
            if (acc[entry.location]) {
                const locationArray = acc[entry.location];
                const last = locationArray[locationArray.length - 1];
                locationArray.push({
                    ...entry,
                    totalCases: entry.newCases + last.totalCases,
                    totalDeaths: entry.newDeaths + last.totalDeaths
                });
            } else {
                acc[entry.location] = [
                    {
                        ...entry,
                        totalCases: entry.newCases,
                        totalDeaths: entry.newDeaths
                    }
                ]
            }
            return acc;
        }, {});
    return Object.values(dataByLocation).flat();
};

const calculateGrandTotal = (data) => {
    const dataWithTotals = data.reduce((acc, entry) => {
        if (!acc[entry.location] || acc[entry.location].totalCases < entry.totalCases) {
            acc[entry.location] = {
                location: entry.location,
                totalCases: entry.totalCases,
                totalDeaths: entry.totalDeaths,
                population: entry.population
            };
        }
        return acc;
    }, {});
    return Object.values(dataWithTotals);
};

const calculateWorldHistorical = (data) => {
    const dataByDate = data.reduce((acc, entry) => {
        const baseEntry = acc[entry.date] || emptyEntry;
        acc[entry.date] = {
            date: entry.date,
            newCases: entry.newCases + baseEntry.newCases,
            newDeaths: entry.newDeaths + baseEntry.newDeaths,
            location: WORLD_LOCATION.location
        };
        return acc;
    }, {});
    return Object.values(dataByDate).flat()
        .sort((entry1, entry2) => moment(entry2.date).diff(moment(entry1.date)));
};

const calculateDoubling = (data) => {
    return data.map((entry, index) => {
        const halfCases = entry.totalCases / 2;
        const halfEntryIndex = rangeUntil(index)
            .reverse()
            .find((i) => data[i].totalCases <= halfCases);
        const halfEntry = halfEntryIndex >= 0 ? data[halfEntryIndex] : {};
        const entryDate = moment(entry.date);
        const halfEntryDate = moment(halfEntry.date || entry.date);
        return {
            ...entry,
            caseDoubleDays: entryDate.diff(halfEntryDate, 'days')
        };
    });
};

const calculatePerMillion = (data) => {
    return data.map((entry) => ({
        ...entry,
        totalCasesPerMillion: (entry.totalCases / entry.population) * 1000000,
        totalDeathsPerMillion: (entry.totalDeaths / entry.population) * 1000000
    }));
};

const combinePopulationData = (data, popData) => {
    return data.map((record) => {
        const displayLocation = states[record.location];
        const match = popData.find((popRecord) => popRecord.displayLocation === displayLocation);
        if (match) {
            return {
                ...record,
                population: match.population
            };
        }
        return record;
    });
};

const distinct = (value, index, self) => self.indexOf(value) === index;

const createCountryList = (countryData) =>
    countryData.map((country) => country.location)
        .filter(distinct)
        .map((location) => ({
            location,
            displayLocation: location.replace(/_/g, ' ')
        }));

const createStateList = (stateData) =>
    stateData.map((state) => state.location)
        .filter(distinct)
        .map((location) => ({
            location,
            displayLocation: states[location]
        }));

const addCountryDisplayLocation = (countryData) =>
    countryData.map((country) => ({
        ...country,
        displayLocation: country.location.replace(/_/g, ' ')
    }));

const addStateDisplayLocation = (stateData) =>
    stateData.map((state) => ({
        ...state,
        displayLocation: states[state.location]
    }));

module.exports = {
    calculateHistoricalTotals,
    calculateWorldHistorical,
    calculateDoubling,
    calculateGrandTotal,
    calculatePerMillion,
    createCountryList,
    createStateList,
    combinePopulationData,
    addCountryDisplayLocation,
    addStateDisplayLocation
};