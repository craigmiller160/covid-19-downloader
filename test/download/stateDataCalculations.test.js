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

const moment = require('moment');
const {
    addPopulationData
} = require('../../src/download/stateDataCalculations');

const censusData = [
    {
        displayLocation: 'Alaska',
        population: 1000
    },
    {
        displayLocation: 'Alabama',
        population: 2000
    }
];

const historyData = [
    {
        location: 'AK',
        date: moment('2020-01-01').toDate(),
        totalCases: 100
    },
    {
        location: 'AK',
        date: moment('2020-01-02').toDate(),
        totalCases: 200
    },
    {
        location: 'AL',
        date: moment('2020-01-01').toDate(),
        totalCases: 300
    },
    {
        location: 'AL',
        date: moment('2020-01-02').toDate(),
        totalCases: 400
    }
];

const expectedWithPop = [
    {
        location: 'AK',
        date: moment('2020-01-01').toDate(),
        totalCases: 100,
        population: 1000
    },
    {
        location: 'AK',
        date: moment('2020-01-02').toDate(),
        totalCases: 200,
        population: 1000
    },
    {
        location: 'AL',
        date: moment('2020-01-01').toDate(),
        totalCases: 300,
        population: 2000
    },
    {
        location: 'AL',
        date: moment('2020-01-02').toDate(),
        totalCases: 400,
        population: 2000
    }
]

describe('stateDataCalculations', () => {
    it('addPopulationData', () => {
        const result = addPopulationData(historyData, censusData);
        expect(result).toEqual(expectedWithPop);
    });
});