const { connect } = require('../mongo');
const TraceError = require('trace-error');
const moment = require('moment');

const COLLECTION = 'state_history';

const setStateHistoricalData = async (stateData) => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
            await db.collection(COLLECTION)
                .insertMany(stateData);
        });
    } catch (ex) {
        throw new TraceError('Error setting state historical data', ex);
    }
};

module.exports = {
    setStateHistoricalData
};