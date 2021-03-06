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
const MockAdapter = require('axios-mock-adapter');
const {
    downloadCurrentDataAllCountries,
    downloadHistoricalDataCountry,
    downloadHistoricalDataWorld,
    BASE_URL,
    COUNTRIES_CURRENT_URI,
    HISTORICAL_URI,
    VACCINE_URI
} = require('../../src/download/downloadDiseaseShData');
const currentDataAllCountriesRaw = require('../__data__/currentDataAllCountries.raw');
const currentDataAllCountriesFormatted = require('../__data__/currentDataAllCountries.formatted');
const historyDataWorldRaw = require('../__data__/historyDataWorld.raw');
const historyDataWorldFormatted = require('../__data__/historyDataWorld.formatted');
const historyDataUSARaw = require('../__data__/historyDataUSA.raw');
const historyDataUSAFormatted = require('../__data__/historyDataUSA.formatted');
const vaccineDataWorldRaw = require('../__data__/vaccineDataWorld.raw');
const vaccineDataUsaRaw = require('../__data__/vaccineDataUSA.raw');

const mockApi = new MockAdapter(axios);
const POPULATION = 10_000_000;

describe('downloadDiseaseShData', () => {
    let lastDays;
    beforeEach(() => {
        mockApi.reset();
        lastDays = moment().diff(moment('2020-01-01'), 'days');
    });

    it('downloadCurrentDataAllCountries', async () => {
        mockApi.onGet(`${BASE_URL}${COUNTRIES_CURRENT_URI}`)
            .reply(200, currentDataAllCountriesRaw);
        const result = await downloadCurrentDataAllCountries();
        expect(result).toEqual(currentDataAllCountriesFormatted);
    });

    it('downloadHistoricalDataWorld', async () => {
        const historicalUrl = `${BASE_URL}${HISTORICAL_URI}/all?lastdays=${lastDays}`;
        const vaccineUrl = `${BASE_URL}${VACCINE_URI}?lastdays=${lastDays}`;
        mockApi.onGet(historicalUrl)
            .reply(200, historyDataWorldRaw);
        mockApi.onGet(vaccineUrl)
            .reply(200, vaccineDataWorldRaw);
        const result = await downloadHistoricalDataWorld();
        expect(result).toEqual(historyDataWorldFormatted);
    });

    it('downloadHistoricalDataCountry', async () => {
        const historicalUrl = `${BASE_URL}${HISTORICAL_URI}/USA?lastdays=${lastDays}`;
        const vaccineUrl = `${BASE_URL}${VACCINE_URI}/countries/USA?lastdays=${lastDays}`;
        mockApi.onGet(historicalUrl)
            .reply(200, historyDataUSARaw);
        mockApi.onGet(vaccineUrl)
            .reply(200, vaccineDataUsaRaw);
        const result = await downloadHistoricalDataCountry('USA', POPULATION);
        expect(result).toEqual(historyDataUSAFormatted);
    });

    it('downloadHistoricalDataCountry not found', async () => {
        const url = `${BASE_URL}${HISTORICAL_URI}/USA?lastdays=${lastDays}`;
        mockApi.onGet(url)
            .reply(404, 'County not found');
        const result = await downloadHistoricalDataCountry('USA', POPULATION);
        expect(result).toEqual([]);
    });
});
