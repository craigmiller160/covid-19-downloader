const { cloudConfig } = require('./config');

console.log('Starting application');
cloudConfig.init()
    .catch((ex) => {
        console.log('Critical error starting application');
        console.log(ex);
    });