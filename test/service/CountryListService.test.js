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

const { dbMock, collectionMock } = require('@craigmiller160/covid-19-config-mongo');
const {
    addCountry,
    clearCountries,
    COLLECTION
} = require('../../src/service/CountryListService');

describe('CountryListService', () => {
    it('addCountry', async () => {
        const country = {
            Slug: 'usa',
            Country: 'USA'
        };
        const expectedCountry = {
            location: 'usa',
            displayLocation: 'USA'
        };
        await addCountry(country);
        expect(dbMock.collection).toHaveBeenCalledWith(COLLECTION);
        expect(collectionMock.insertOne).toHaveBeenCalledWith(expectedCountry);
    });

    it('clearCountries', async () => {
        await clearCountries();
        expect(dbMock.collection).toHaveBeenCalledWith(COLLECTION);
        expect(collectionMock.deleteMany).toHaveBeenCalled();
    });
});