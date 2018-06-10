# Mongo News Scrapper

This app uses the axios and cheerio NPM packages to scrape news articles from *The Onion*, and Mongoose to create models for easy use with MongoDB. 

## User Stories

1. I have the ability to sign up as a new user, and log in as an existing user.
2. I can click a button to scrape articles from *The Onion*
3. As an authenticated user I can click a button to add an article to my saved articles tab.
4. As an authenticated user I can add a note to any of my saved articles.
5. As an authenticated user I can delete a note I created on any of my saved articles.
6. As an authenticated user I can see notes left by other users on my saved articles.
7. As an authenticated user I can remove an article from my saved list.
8. At any time I can clear all data in the db by going to the `/clear` route.
9. If I request a page that does not exist I will get a 404 error.
10. If I request a page I do not have permission to acccess I will get a 403 error. (Ex: accessing saved artiles without being authenticated)

## Download and Installation

If you want to install this on your local machine, first install all modules with `npm i`.

This application uses gulp for task automation as well as running a live server. Once all dependencies are installed you can easily get the Bootstrap and jQuery source files by running `gulp getfiles`. This will create a directory in public called vendor, and it will store the Bootstrap and jQuery core files. It will then automatically move the needed files from `./public/vendor` to `./public/js` & `./public/css`. Once Bootstrap and jQuery files are moved the vendor directory can be deleted.

The live server is set as the default gulp task. To run the server first start `mongod` from the terminal, and then execute the `gulp` command. This starts up browser-sync, which auto-reloads the browser on any html and css change, as well as re-starts the node server upon any change to a .js file.

Once gulp is watching for changes it will automatically run the tasks to compile scss down to css, as well as minify the js and css files.