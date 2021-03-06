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

process.env.DOWNLOAD_RETRY_ATTEMPTS = 5;
process.env.DOWNLOAD_RETRY_WAIT = 10;
process.env.LOGGER_LEVEL = 'debug';

jest.mock('@craigmiller160/covid-19-config-mongo', () => {
    const actualDependency = jest.requireActual('@craigmiller160/covid-19-config-mongo');
    const collectionMock = {
        insertMany: jest.fn().mockImplementation(() => Promise.resolve()),
        deleteMany: jest.fn().mockImplementation(() => Promise.resolve()),
        insertOne: jest.fn().mockImplementation(() => Promise.resolve()),
        replaceOne: jest.fn().mockImplementation(() => Promise.resolve())
    };

    const dbMock = {
        collection: jest.fn().mockImplementation(() => collectionMock)
    };

    return {
        ...actualDependency,
        connect: (dbFunction) => dbFunction(dbMock),
        dbMock,
        collectionMock
    };
});


beforeEach(() => {
    jest.clearAllMocks();
});