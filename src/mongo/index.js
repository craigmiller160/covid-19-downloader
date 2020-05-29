const { MongoClient } = require('mongodb');
const { cloudConfig, MONGO_HOST, MONGO_AUTH_DB, MONGO_PASS, MONGO_USER, MONGO_PORT } = require('../config');

const connect = async (handler) => {
    await cloudConfig.init();
    const mongoUser = cloudConfig.config[MONGO_USER];
    const mongoPass = cloudConfig.config[MONGO_PASS];
    const mongoDb = process.env.MONGO_DATABASE
    const mongoAuthDb = cloudConfig.config[MONGO_AUTH_DB]
    const mongoHost = cloudConfig.config[MONGO_HOST];
    const mongoPort = cloudConfig.config[MONGO_PORT];
    const mongoConnectionString = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=${mongoAuthDb}`;
    const options = {
        useUnifiedTopology: true
    };

    let client;
    try {
        client = await MongoClient.connect(mongoConnectionString, options);
        const db = client.db();
        return await handler(db);
    } finally {
        if (client) {
            await client.close();
        }
    }
};

module.exports = connect;