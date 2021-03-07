const moment = require('moment');

/*
 * 1) Identify the month and year of the record.
 * 2) Track the "current" month and year.
 * 3) Record the first totals for month/year as "start" in the output.
 * 4) When the month changes, retrieve the previous record value as the last value for that month/year
 */

const MONTH_YEAR_FORMAT = 'YYYYMM';

const calculateRangeData = (data) => {
    const organizedData = data
        .reduce((acc, record, index) => {
            const monthYear = moment(record.date).format(MONTH_YEAR_FORMAT);
            if (index === 0) {
                return {
                    ...acc,
                    [`startTotalCases_${monthYear}`]: record.totalCases,
                    [`startTotalDeaths_${monthYear}`]: record.totalDeaths,
                    lastRecord: record
                }
            }

            const sameMonth = !!acc[monthYear];
            if (!sameMonth) {
                const lastMonthYear = moment(acc.lastRecord.date).format(MONTH_YEAR_FORMAT);
                return {
                    ...acc,
                    [`endTotalCases_${lastMonthYear}`]: acc.lastRecord.totalCases,
                    [`endTotalDeaths_${lastMonthYear}`]: acc.lastRecord.totalDeaths,
                    [`startTotalCases_${monthYear}`]: record.totalCases,
                    [`startTotalDeaths_${monthYear}`]: record.totalDeaths,
                    lastRecord: record
                };
            }

            return {
                ...acc,
                lastRecord: record
            };
        }, {});
    return {
        ...organizedData,
        lastRecord: undefined
    };
};

module.exports = {
    calculateRangeData
};
