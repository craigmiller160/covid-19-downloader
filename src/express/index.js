const express = require('express');
const { logger } = require('@craigmiller160/covid-19-config-mongo');

const app = express();
const port = process.env.PORT;

app.get('/healthcheck', (req, res) => {
    logger.debug('Received healthcheck request');
    res.send('Healthy');
});

app.listen(port, () => logger.info('Express Server running'));