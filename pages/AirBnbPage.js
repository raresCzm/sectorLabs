const { expect } = require('@playwright/test');
const testData = require('./testData.json');

exports.AirBnbPage = class AirBnbPage  {

    constructor(page) {
        this.page = page;
        this.searchFieldLocation = this.page.locator('input[name="query"]');
        this.pickDate = this.page.locator('.lk4ruxu', { hasText: 'Check in' });
        this.addPeople = this.page.locator('[data-testid="structured-search-input-field-guests-button"]');
        this.addAdultsButton = this.page.locator('[data-testid="stepper-adults-increase-button"]');
        this.addChildrenButton = this.page.locator('[data-testid="stepper-children-increase-button"]');
        this.searchButton = this.page.locator('[data-testid="structured-search-input-search-button"]');
        this.filtersButton = this.page.locator('[data-testid="category-bar-filter-button"]');
        this.increaseBedroomsButton = this.page.locator('[data-testid="stepper-filter-item-min_bedrooms-stepper-increase-button"]');
        this.showMoreButton = this.page.locator('span:has-text("Show more")');
        this.poolButton = this.page.locator('button:has-text("Pool")');
        this.showPlacesButton = this.page.locator('div[class*="ptiimno"] a');
        this.bedroomsValue = this.page.locator('div[data-testid="stepper-filter-item-min_bedrooms-stepper-value"]');
        this.closeFiltersButton = this.page.locator('button[aria-label="Close"].l1ovpqvx');
    }

    async goToAirBnb() {
        await this.page.goto('https://www.airbnb.com/');
    }

    async addLocation(location) {
        await this.searchFieldLocation.fill(location);
    }

    async addCheckInDateAndCheckOutDate() {
        await this.pickDate.click();
        // Calculate the check-in date, which is one week from now
        const today = new Date();
        console.log(today);
        const checkInDate = new Date();
        checkInDate.setDate(today.getDate() + 7);
        console.log('checkIn date : ' + checkInDate);

        // Extract the day, month, and year from the checkIn date
        const day = checkInDate.getDate().toString().padStart(2, '0');  // Pad with 0 if it's a single digit
        const month = (checkInDate.getMonth() + 1).toString().padStart(2, '0');  // Month is 0-indexed, so add 1
        const year = checkInDate.getFullYear();

        // Create the selector for the specific date
        const dateTestId = `${month}/${day}/${year}`;
        console.log('Selector: ', dateTestId);

        // Wait for the dynamically created selector to be visible
        await this.page.waitForSelector(`div[data-testid="${dateTestId}"]`);

        // Select the date using the dynamically created selector
        const checkInDateElement = await this.page.locator(`div[data-testid="${dateTestId}"]`);

        // Click the date
        await checkInDateElement.click();

        //check-out Date
        // Calculate the check-out date, which is one week after check-in date
        const checkOutDate = new Date(checkInDate); // Clone the check-in date
        checkOutDate.setDate(checkInDate.getDate() + 7); // Add 7 days
        console.log('Check-out date: ' + checkOutDate);

        // Get the formatted check-out date
        const checkOutDay = checkOutDate.getDate().toString().padStart(2, '0');
        const checkOutMonth = (checkOutDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
        const checkOutSelector = `div[data-testid="${checkOutMonth}/${checkOutDay}/${checkOutDate.getFullYear()}"]`;

        // Wait for the check-out date to be visible and click it
        await this.page.waitForSelector(checkOutSelector);
        await this.page.click(checkOutSelector);

    }

    async addGuests(adultNumber, childrenNumber) {
        await this.addPeople.click();
        for (let i = 0; i < adultNumber; i++) {
            await this.addAdultsButton.click();
        }
        for (let i = 0; i < childrenNumber; i++) {
            await this.addChildrenButton.click();
        }
    }

    async search() {
        await this.searchButton.click();
    }

    async checkSearch() {
        await this.page.waitForTimeout(3000);

        const expectedLocation = testData.searchTestData.expectedLocation;
        const actualLocation = await this.searchFieldLocation.inputValue();
        //verify location
        expect(actualLocation).toBe(expectedLocation);
        console.log('location verified! Actual location is ' + actualLocation + ' and expected location is: ' + expectedLocation);

        const expectedGuests = testData.searchTestData.expectedAdults + testData.searchTestData.expectedChildren;
        console.log("guests: " + expectedGuests)
        const guestsLocator = this.page.locator('div.atm_c8_1cw7z3g.atm_g3_qslrf5.atm_l8_1mni9fk.atm_ks_15vqwwr', { hasText: 'guests' });
        const extractedGuestsText = await guestsLocator.innerText();
        // Extract the number of guests as an integer
        const numberOfGuests = parseInt(extractedGuestsText.split(' ')[0], 10);

        //compare number of guests
        expect(expectedGuests).toBe(numberOfGuests);
        console.log('Guests verified! Actual number is ' + expectedGuests + ' and expected number is: ' + numberOfGuests);

    }

    //Verify that the properties displayed on the first page can accommodate the selected number of guests.
    async openAndCheckFirstThreeProperties() {
        // Get all property links
        const getPropertyLinks = async () => this.page.locator('a[rel="noopener noreferrer nofollow"][href^="/rooms/"]');

        // Check if there are at least 3 results
        let propertyLinks = await getPropertyLinks();
        const count = await propertyLinks.count();
        if (count < 3) {
            console.log(`Only ${count} search results found, less than 3.`);
            return;
        }

        // Loop over the first 3 properties
        for (let i = 0; i < 3; i++) {

            console.log('Checking property ' + (i + 1))
            const propertyLink = propertyLinks.nth(i);

            // Get the URL of the property
            const propertyUrl = await propertyLink.getAttribute('href');

            // Open the property in the same tab
            await this.page.goto(`https://www.airbnb.com${propertyUrl}`);

            // Check the guest count
            await this.checkGuestsCount(); // Call method to check guest count

            // After checking, go back to the previous page (search results)
            await this.page.goBack();

        }
    }


    async checkGuestsCount() {
        // Locate the li element that contains the number of guests
        const guestsElement = this.page.locator('li:has-text("guests")');

        // Get the text content of the element
        const guestsText = await guestsElement.textContent();

        // Extract the number from the text (assuming the format is consistent)
        const guestsNumberMatch = guestsText.match(/(\d+)/);
        const guestsNumber = guestsNumberMatch ? parseInt(guestsNumberMatch[1], 10) : NaN; // Convert text to integer

        // Check if the number of guests is 3 or more
        if (!isNaN(guestsNumber) && guestsNumber >= 3) {
            console.log(`The property can accommodate the number of desired guests`);
        } else {
            console.log(`The property cannot accommodate: ${guestsNumber} guests`);
        }
    }


    //methods for test no 2
    async addMoreFilters(noOfBedrooms, poolExistence) {
        await this.filtersButton.click();
        await this.increaseBedroomsNumber(noOfBedrooms);
        //add pool 
        if (poolExistence == true) {
            await this.showMoreButton.click();
            await this.poolButton.click();
            await this.showPlacesButton.click();
        }

    }

    async increaseBedroomsNumber(noOfBedrooms) {
        for (let index = 0; index < noOfBedrooms; index++) {
            await this.increaseBedroomsButton.click();

        }
    }

    async checkMoreFilters() {
        //go to filters and check if the 2 new filters are there
        await this.filtersButton.click();
        // Get the text content of the locator
        const bedroomsText = await this.bedroomsValue.textContent();

        // Extract the number and compare it
        const bedroomsNumber = parseInt(bedroomsText.replace('+', '').trim(), 10); // Remove '+' if present and convert to integer

        // Check if the value is at least 5 bedrooms
        if (bedroomsNumber >= 5) {
            console.log('There are at least 5 bedrooms.');
        } else {
            console.log('There are less than 5 bedrooms.');
        }
        //check if the pool exists
        //Check if 'aria-pressed' attribute from 'poolButton' is set to true
        await this.showMoreButton.click();
        const isPressed = await this.poolButton.getAttribute('aria-pressed');
        if (isPressed === 'true') {
            console.log("The Pool preference is set.");
        } else {
            console.log("Pool preference is not set.");
        }
        await this.closeFiltersButton.click();

    }

    //step2 for test2
    //open the details of first property and check the presence of 5 bedrooms and pool

    async goToFirstPropertyFound() {
        // Get the first property link
        const firstPropertyLink = await this.page.locator('a[rel="noopener noreferrer nofollow"][href^="/rooms/"]').first();

        // Retrieve the URL from the first property link
        const propertyUrl = await firstPropertyLink.getAttribute('href');

        // Navigate to the property URL
        await this.page.goto(`https://www.airbnb.com${propertyUrl}`);

        // Wait for the new tab to load
        const [newTab] = await this.page.context().pages(); // Get the newly opened tab
        await newTab.waitForLoadState(); // Ensure the tab has fully loaded

        //close the pop-up displayed in new tab
        const closeButton = await this.page.locator('button[aria-label="Close"]').click();

        //identify in the new tab if there are at least 5 bedrooms for this property and a pool
        await this.checkBedrooms();

        await this.checkForPool();
    }

    //these methods are used after we open the tab with the first property
    async checkBedrooms() {
        // Locate the li element that contains the number of bedrooms
        const bedroomsElement = this.page.locator('li:has-text("bedrooms")');

        // Get the text content of the element
        const bedroomsText = await bedroomsElement.textContent();

        // Extract the number from the text (assuming the format is consistent)
        const bedroomsNumber = parseInt(bedroomsText, 10); // Convert text to integer

        // Check if the number of bedrooms is 5 or more
        if (bedroomsNumber >= 5) {
            console.log('There are at least 5 bedrooms for the first property found.');
        } else {
            console.log('There are less than 5 bedrooms for the first property found.');
        }
    }

    async checkForPool() {
        // Locate the h3 element that indicates the property has a pool
        const poolElement = this.page.locator('h3:has-text("Dive right in")');

        // Check if the element is visible on the page
        const isPoolPresent = await poolElement.isVisible();

        // Log a message to the console based on the presence of the pool
        if (isPoolPresent) {
            console.log('The property has a pool.');
        } else {
            console.log('The property does not have a pool.');
        }
    }

    //test no 3
    async hoverOverFirstPropertyAndCheckTheMap() {

        await this.page.waitForTimeout(3000);
        // General locator for the first property link (based on URL containing '/rooms/')
        const firstPropertyLink = this.page.locator('a[href^="/rooms/"]').first();

        // Hover over the first property link
        await firstPropertyLink.hover({ force: true });

        // Log action for visibility
        console.log("Hovered over the first property link.");

        await this.checkPinVisibleOnMap();


    }

    async checkPinVisibleOnMap() {
        // Now check for the selected property
        const mapPinSelected = await this.page.locator('span.selected');

        if (mapPinSelected) {
            console.log("The property is displayed on the map and highlighted.");
        } else {
            console.log("The property is not displayed or not highlighted on the map.");
        }

    }

    async closeWebPage() {
        await this.page.context().close();
    }




}