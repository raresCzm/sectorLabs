const { test, expect } = require('@playwright/test');
const { AirBnbPage } = require('../pages/AirBnbPage');
// Import test data from JSON file
const testData = require('../pages/testData.json');

test.describe('test 3', () => {
    test('hover over property and check the map', async ({ page }) => {
        //
        const airBnb = new AirBnbPage(page);

        //location
        await airBnb.goToAirBnb();
        await airBnb.addLocation(testData.searchTestData.expectedLocation);

        //checkIn
        await airBnb.addCheckInDateAndCheckOutDate();

        //add guests
        await airBnb.addGuests(testData.searchTestData.expectedAdults, testData.searchTestData.expectedChildren);

        //search
        await airBnb.search();

        //check filters
        await airBnb.checkSearch();

        //await airBnb.checkFirstThreeResults();

        //hover over first property 
        await airBnb.hoverOverFirstPropertyAndCheckTheMap();

        await airBnb.closeWebPage();


    });


});