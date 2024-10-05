const { test, expect } = require('@playwright/test');
const { AirBnbPage } = require('../pages/AirBnbPage');
// Import test data from JSON file
const testData = require('../pages/testData.json');

test.describe('test 1', () => {
    test('search location, period, persons', async ({ page }) => {
        //
        const airBnb=new AirBnbPage(page);

        //location
        await airBnb.goToAirBnb();
        await airBnb.addLocation(testData.searchTestData.expectedLocation);

        //checkIn
        await airBnb.addCheckInDateAndCheckOutDate();

        //add guests
        await airBnb.addGuests(testData.searchTestData.expectedAdults,testData.searchTestData.expectedChildren);

        //search
        await airBnb.search();

        //check filters
        await airBnb.checkSearch();

        await airBnb.openAndCheckFirstThreeProperties();

        await airBnb.closeWebPage();



    });


});