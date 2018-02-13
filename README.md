## Content Webscraper

This is a content webscraper used to get information from [http://shirts4mike.com/shirts.php](http://shirts4mike.com/shirts.php). It retrieves information about shirt items on the site.

This is node.js/npm and [Ramda](http://ramdajs.com/) project. It uses [JSDOM](https://github.com/jsdom/jsdom) for the HTML DOM scrapping and [node-csv-stringify](https://github.com/adaltas/node-csv-stringify) for the CSV stringifying of JSON objects.

## Running The Application

Just run the application with the command line: `npm start`. This ensures that the application will run with all of its features.

## How To Use

Once the application has run, it will scrape the necessary information needed and then create a CSV file with the results in it. The CSV file is named based off of the current date and is located in the *data* directory.

It obtains information about the title, price, the image url, the url link, and the time it was obtained from each shirt item. The same properties are listed as columns in the CSV, with each row representing each shirt.

If contents are successfully scraped, a success message is displayed and the application ends. In contrast, if the application runs into an error, the error is logged to the console and is also logged to a file in *logs/scraper-error.log*.

**__NOTE:__** The application may take some time to process depending on the internet connection. If nothing appears to be happening, just wait. A message will eventually pop up.
