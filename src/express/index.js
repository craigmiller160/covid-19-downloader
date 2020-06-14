const express = require('express');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const app = express();

app.get('/healthcheck', (req, res) => {
    logger.debug('Received healthcheck request');
    res.send('Healthy');
});

app.listen(3000, () => logger.info('Express Server running'));