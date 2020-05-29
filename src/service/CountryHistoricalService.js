const { connect } = require('../mongo');
const TraceError = require('trace-error');
const moment = require('moment');

const COLLECTION = 'country_history';

const setCountryHistoricalData = async (countryData) => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
            await db.collection(COLLECTION)
                .insertMany(countryData);
        });
    } catch (ex) {
        throw new TraceError('Error setting historical country data', ex);
    }
};

module.exports = {
    setCountryHistoricalData
};