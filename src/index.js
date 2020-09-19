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

const downloadDataToMongo = require('./download');
require('./express');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const INTERVAL = process.env.DOWNLOAD_INTERVAL_HRS * 60 * 60 * 1000;

const handleError = (ex) => {
    logger.error('Error downloading data to MongoDB');
    logger.error(ex);
};

const runDownloadLoop = async () => {
    try {
        await downloadDataToMongo();
    } catch (ex) {
        handleError(ex);
    }

    setInterval(async () => {
        try {
            await downloadDataToMongo();
        } catch (ex) {
            handleError(ex);
        }
    }, INTERVAL);
};

logger.info('Starting application');
runDownloadLoop()
    .catch((ex) => {
        logger.error('Critical error starting application');
        logger.error(ex);
    });