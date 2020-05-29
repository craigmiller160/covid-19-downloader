const { connect } = require('../mongo');
const TraceError = require('trace-error');

const COLLECTION = 'states';
const setStateList = async (stateList) => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
            await db.collection(COLLECTION)
                .insertMany(stateList);
        });
    } catch (ex) {
        throw new TraceError('Error setting state list', ex);
    }
};

module.exports = {
    setStateList
};