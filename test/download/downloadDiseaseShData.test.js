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
    HISTORICAL_URI
} = require('../../src/download/downloadDiseaseShData');
const currentDataAllCountriesRaw = require('../__data__/currentDataAllCountries.raw');
const currentDataAllCountriesFormatted = require('../__data__/currentDataAllCountries.formatted');
const historyDataWorldRaw = require('../__data__/historyDataWorld.raw');
const historyDataWorldFormatted = require('../__data__/historyDataWorld.formatted');

const mockApi = new MockAdapter(axios);

describe('downloadDiseaseShData', () => {
    beforeEach(() => {
        mockApi.reset();
    });

    it('downloadCurrentDataAllCountries', async () => {
        mockApi.onGet(`${BASE_URL}${COUNTRIES_CURRENT_URI}`)
            .reply(200, currentDataAllCountriesRaw);
        const result = await downloadCurrentDataAllCountries();
        expect(result).toEqual(currentDataAllCountriesFormatted);
    });

    it('downloadCurrentDataAllCountries multiple attempts', async () => {
        mockApi.onGet(`${BASE_URL}${COUNTRIES_CURRENT_URI}`)
            .replyOnce(500, 'Failed');
        mockApi.onGet(`${BASE_URL}${COUNTRIES_CURRENT_URI}`)
            .reply(200, currentDataAllCountriesRaw);
        const result = await downloadCurrentDataAllCountries();
        expect(result).toEqual(currentDataAllCountriesFormatted);
    });

    it('downloadHistoricalDataWorld', async () => {
        const lastDays = moment('2020-01-01').diff(moment(), 'days');
        const url = `${BASE_URL}${HISTORICAL_URI}/all?lastdays=${lastDays}`;
        mockApi.onGet(url)
            .reply(200, historyDataWorldRaw);
        const result = await downloadHistoricalDataWorld();
        expect(result).toEqual(historyDataWorldFormatted);
    });

    it('downloadHistoricalDataWorld multiple attempts', async () => {
        const lastDays = moment('2020-01-01').diff(moment(), 'days');
        const url = `${BASE_URL}${HISTORICAL_URI}/all?lastdays=${lastDays}`;
        mockApi.onGet(url)
            .replyOnce(500, 'Failed');
        mockApi.onGet(url)
            .reply(200, historyDataWorldRaw);
        const result = await downloadHistoricalDataWorld();
        expect(result).toEqual(historyDataWorldFormatted);
    });

    it('downloadHistoricalDataCountry', () => {
        throw new Error();
    });

    it('downloadHistoricalDataCountry multiple attempts', () => {
        throw new Error();
    });
});