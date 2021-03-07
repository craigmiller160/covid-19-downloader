const { calculateRangeData } = require('../../src/download/calculateRangeData');

const mockData = [
    {
        location: 'USA',
        date: new Date('2020-01-01T05:00:00Z'),
        totalCases: 100,
        totalDeaths: 10
    },
    {
        location: 'USA',
        date: new Date('2020-01-15T05:00:00Z'),
        totalCases: 120,
        totalDeaths: 30
    },
    {
        location: 'USA',
        date: new Date('2020-01-31T05:00:00Z'),
        totalCases: 150,
        totalDeaths: 40
    },
    {
        location: 'USA',
        date: new Date('2020-02-01T05:00:00Z'),
        totalCases: 160,
        totalDeaths: 41
    },
    {
        location: 'USA',
        date: new Date('2020-02-15T05:00:00Z'),
        totalCases: 180,
        totalDeaths: 50
    },
    {
        location: 'USA',
        date: new Date('2020-02-28T05:00:00Z'),
        totalCases: 200,
        totalDeaths: 55
    },
    {
        location: 'USA',
        date: new Date('2020-03-01T05:00:00Z'),
        totalCases: 211,
        totalDeaths: 61
    },
    {
        location: 'USA',
        date: new Date('2020-03-15T05:00:00Z'),
        totalCases: 250,
        totalDeaths: 80
    },
    {
        location: 'USA',
        date: new Date('2020-03-31T05:00:00Z'),
        totalCases: 310,
        totalDeaths: 113
    }
];

const expectedResult = {
    startTotalCases_202001: 100,
    startTotalDeaths_202001: 10,
    endTotalCases_202001: 150,
    endTotalDeaths_202001: 40,
    startTotalCases_202002: 160,
    startTotalDeaths_202002: 41,
    endTotalCases_202002: 200,
    endTotalDeaths_202002: 55,
    startTotalCases_202003: 211,
    startTotalDeaths_202003: 61,
    endTotalCases_202003: 310,
    endTotalDeaths_202003: 113
};

describe('calculateRangeData', () => {
    it('calculates ranges', () => {
        const result = calculateRangeData(mockData);
        expect(result).toEqual(expectedResult);
    });
});
