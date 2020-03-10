# VK Watcher [Front End]
Front end web application for processing data from [VKWatcher-Backend ](https://github.com/Azarattum/VKWatcher-Backend)

## Features:
  - Collect the data from your backend API
  - View all your data in an intuitive table format
  - Apply filters to the collected data
  - Build a graph based on your data
  - Run analyzers on your data
  - Compatible with mobile devices
  - Offline-first architecture
  - Neural network powered user sleep analysis
  - And more...

### Usage:
Start your web server from *./dist* folder. 
Sessions data is requested from the [remote API](https://github.com/Azarattum/VKWatcher-Backend).
Your can change the API address in *./src/components/app/app.ts* file.


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
