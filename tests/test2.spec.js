const { test, expect } = require('@playwright/test');
const { AirBnbPage } = require('../pages/AirBnbPage');
// Import test data from JSON file
const testData = require('../pages/testData.json');

test.describe('test 2', () => {
    test('add more filters for searc', async ({ page }) => {
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

        //add more filters
        await airBnb.addMoreFilters(5, true);

        //check the new filters
        await airBnb.checkMoreFilters();

        //open first property link and check the bedrooms and the pool presence
        await airBnb.goToFirstPropertyFound();

        await airBnb.closeWebPage();


    });


});