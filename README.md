# VK Watcher [Front End]
Front end web application for processing data from VKWatcher-Backend

## Features:
  - View all your data in an intuitive table format
  - Apply filters to the collected data
  - Build a graph based on your data
  - Compatible with mobile devices
  - And more...

### Usage:
Start your web server from *./dist* folder. Note that **sessions.json** is requested from */assets/* by now.

### Installation: 
Install all dependencies:
```sh
npm install
```

### NPM Scripts:
| Script    | Description                                             |
| --------- | ------------------------------------------------------- |
| **serve** | Starts the webpack development server                   |
| release   | Creates a production build of the project               |
| build     | Builds the entire project with webpack                  |
| watch     | Watches all file changes and rebuilds them if necessary |