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
            const lastMonthYear = acc.lastRecord ? moment(acc.lastRecord.date).format(MONTH_YEAR_FORMAT) : null;
            if (index === 0) {
                return {
                    ...acc,
                    location: record.location,
                    [`startTotalCases_${monthYear}`]: record.totalCases,
                    [`startTotalDeaths_${monthYear}`]: record.totalDeaths,
                    lastRecord: record,
                    population: record.population
                }
            }

            if (monthYear !== lastMonthYear) {
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

            if (index === data.length - 1) {
                return {
                    ...acc,
                    [`endTotalCases_${monthYear}`]: record.totalCases,
                    [`endTotalDeaths_${monthYear}`]: record.totalDeaths
                };
            }

            return {
                ...acc,
                lastRecord: record
            };
        }, {});
    delete organizedData.lastRecord;
    return organizedData;
};

module.exports = {
    calculateRangeData
};
