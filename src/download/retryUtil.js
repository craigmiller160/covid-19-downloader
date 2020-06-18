const retry = require('retry');

const attempt = (action, options) => new Promise((resolve, reject) => {
    const operation = retry.operation(options);
    operation.attempt(async (currentAttempt) => {
        try {
            let result = action(currentAttempt);
            if (result instanceof Promise) {
                result = await result;
            }
            resolve(result);
        } catch (ex) {
            if (operation.retry(ex)) {
                return;
            }
            reject(ex);
        }
    });
});

module.exports = {
    attempt
};