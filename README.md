EAT OUT
=======
A clone of numerous websites for finding random places to eat around you!

Demo
----
You can view a demo of the site at: [Eat-Out Heroku](http://eat-out.herokuapp.com/)

How to Build
------------
- Clone the repository using `git`
- Get a zomato developer key from [Zomato Developer API](https://developers.zomato.com/api#headline2)
- export the zomato developer key as `ZOMATO_KEY` variable
- Get a Google JavaScript API developer key
- export it as `MAP_KEY` variable
- For running development version of the site which first builds then starts a nodemon and watch server, run: `grunt`
- For building production (minified and uglified assets) do: `grunt build`, export `NODE_ENV` to production, and start the server 
yourself using `npm start`

I personally don't inject watch scripts and use the chrome extension for reloading the page. If you don't prefer the extension then 
please add the script `livereload.js` so that the page can reload on change. More info here:- 
[grunt-watch Live Reloading](https://github.com/gruntjs/grunt-contrib-watch#enabling-live-reload-in-your-html)

If you don't want to watch for changes, then you can build manually and start the server yourself:
- css using `grunt sass`
- js using `grunt browserify`
- start server using either of `node app/app.js` or `npm start` the latter runs the former command :D

Some additional info
--------------------
There are two major parts to any webdev project - client side and server side

### Server Side ###
Under the app folder `app.js` and `zomato.js` are server side scripts. `app.js` is responsible for creating the server and handling 
requests while `zomato.js` is responsible for quering `Zomato API` and getting the relevant data.

### Client Side ###
The client side assets are under `app/static` folder. Whenever you run `grunt`, `grunt sass`, or `grunt browserify` only the build happens without any minification or uglification and the results are put in `app/dev` folder. This folder is used then the app is run in
development mode.

When you do `grunt build` then minified and uglified assets are places in `app/public` folder which is used by the app when it is run
in production mode.

Until you manually export `NODE_ENV` to production, the app will keep using assets from `app/dev` folder.

### Note ###
- Running `grunt` will automatically set `NODE_ENV` to development for envify
- Running `grunt build` will automatically set `NODE_ENV` to production for envify (Required for minifying react scripts)

Contributing
------------
Please feel free to send pull requests

Tech Stack
----------
- Nodejs
- Expressjs
- React
- Scss
- Grunt

TODO
----
- Actually random results
- Add tests
