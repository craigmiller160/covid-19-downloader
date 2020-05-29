const { connect } = require('../mongo');
const TraceError = require('trace-error');

const COLLECTION = 'country_current';

const setCountryCurrentData = async (countryData) => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
            await db.collection(COLLECTION)
                .insertMany(countryData);
        });
    } catch (ex) {
        throw new TraceError('Error setting current country data', ex);
    }
};

module.exports = {
    setCountryCurrentData
};