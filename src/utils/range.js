
const rangeUntil = (endingExclusive) => [...new Array(endingExclusive).keys()];
const rangeTo = (endingInclusive) => [...new Array(endingInclusive + 1).keys()];

module.exports = {
    rangeUntil,
    rangeTo
};