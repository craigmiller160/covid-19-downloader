const { connect } = require('@craigmiller160/covid-19-config-mongo');
const TraceError = require('trace-error');

const COLLECTION = 'state_current';

const setStateCurrentData = async (stateData) => {
    try {
        const data = await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
            await db.collection(COLLECTION)
                .insertMany(stateData);
        });
    } catch (ex) {
        throw new TraceError('Error setting current state data', ex);
    }
};

module.exports = {
    setStateCurrentData
};