const { connect } = require('../mongo');
const TraceError = require('trace-error');
const moment = require('moment');

const COLLECTION = 'metadata';

const setMetadata = async (downloadDate) => {
    try {
        await connect(async (db) => {
            await db.collection(COLLECTION)
                .deleteMany();
            await db.collection(COLLECTION)
                .insertOne({
                    downloadDate
                });
        });
    } catch (ex) {
        throw new TraceError('Error setting metadata', ex);
    }
};

module.exports = {
    setMetadata
};