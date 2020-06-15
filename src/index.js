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