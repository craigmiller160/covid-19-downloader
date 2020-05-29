const { cloudConfig } = require('@craigmiller160/covid-19-config-mongo');
const downloadDataToMongo = require('./download');

const INTERVAL = 30000; // TODO make this configurable

const handleError = (ex) => {
    console.log('Error downloading data to MongoDB');
    console.log(ex);
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

console.log('Starting application');
cloudConfig.init()
    .then(runDownloadLoop)
    .catch((ex) => {
        console.log('Critical error starting application');
        console.log(ex);
    });