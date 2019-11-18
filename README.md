# VK Watcher [Front End]
Front end web application for processing data from VKWatcher-Backend

## Features:
  - View all your data in an intuitive table format
  - Apply filters to the collected data
  - Build a graph based on your data
  - Compatible with mobile devices
  - And more...

### Usage:
Start your web server from *./dist* folder.

### Installation (DEV): 
Install all the development dependencies:
```sh
npm install --dev
```

### NPM Scripts:
| Script			| Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| **build**			| Builds the entire project
| **watch**        	| Watches all files and rebuilds them if necessary
| **clean**			| Cleans up unnecessary files and empty folders from the built
| clean:win			| Windows ipmlementation of the script above
| build:html		| Builds all .pug files into .html
| build:js			| Builds all .ts files into .js
| build:css         | Builds all .scss files into .css
| watch:html        | Watches changes in .pug files and rebuilds them
| watch:js          | Watches changes in .ts files and rebuilds them
| watch:css         | Watches changes in .scss files and rebuilds them