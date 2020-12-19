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
const MockAdapter = require('axios-mock-adapter');

const mockApi = new MockAdapter(axios);

describe('downloadDiseaseShData', () => {
    beforeEach(() => {
        mockApi.reset();
    });

    it('downloadCurrentDataAllCountries', () => {
        throw new Error();
    });

    it('downloadCurrentDataAllCountries multiple attempts', () => {
        throw new Error();
    });

    it('downloadHistoricalDataWorld', () => {
        throw new Error();
    });

    it('downloadHistoricalDataWorld multiple attempts', () => {
        throw new Error();
    });

    it('downloadHistoricalDataCountry', () => {
        throw new Error();
    });

    it('downloadHistoricalDataCountry multiple attempts', () => {
        throw new Error();
    });
});