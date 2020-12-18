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

const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const {
    downloadCountryList,
    downloadCountryHistory,
    BASE_URL,
    COUNTRIES_URI,
    COUNTRY_HISTORY_URI
} = require('../../src/download/downloadCovidApiData');

const mockApi = new MockAdapter(axios);

describe('downloadCovidApiData', () => {
    beforeEach(() => {
        mockApi.reset();
    });

    it('downloadCountryList', async () => {
        mockApi.onGet(`${BASE_URL}${COUNTRIES_URI}`)
            .reply(200, 'Countries Success');
        const result = await downloadCountryList();
        expect(result).toEqual('Countries Success');
    });

    it('downloadCountryList multiple attempts', async () => {
        mockApi.onGet(`${BASE_URL}${COUNTRIES_URI}`)
            .replyOnce(500, 'Error');
        mockApi.onGet(`${BASE_URL}${COUNTRIES_URI}`)
            .reply(200, 'Countries Success');
        const result = await downloadCountryList();
        expect(result).toEqual('Countries Success');
    });

    it('downloadCountryHistory', () => {
        throw new Error();
    });

    it('downloadCountryHistory multiple attempts', () => {
        throw new Error();
    });
});