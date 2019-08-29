# Stock Mark
> An stock market application that monitors information and historical prices for traded stocks

### TECHNOLOGIES USED

The following technologies were used to build this application.

* [jQuery](https://jquery.com/)
* [SCSS](http://sass-lang.com/)
* [Babel](https://babeljs.io/)
* [Webpack](https://webpack.js.org/)
* [Navigo](https://github.com/user/krasimir/navigo)
* [Axios](https://github.com/axios/axios)
* [Chart.js](https://www.chartjs.org/)
* [Store](https://github.com/nbubna/store) (local storage)

### API REFERENCE

The IEX Cloud API was used for this application. To learn more about the IEX CLoud API [click here](https://iexcloud.io/docs/api/)

### START APP LOCALLY

1. Set up Sanbox environment
	- Open **const.js** file
	- Change `URL_BASE` and `API_TOKEN` variables to the sandbox variables provide in the comment section of this file
	- This sandbox environment allows for unlimited calls to the API
	- NOTE: API calls will not work unless the `URL_BASE` and `API_TOKEN` variables are updated to the sandbox variables
2. From the root directory run `python -m SimpleHTTPServer 8000`
3. To compile changes, run `webpack --watch`
4. Open browser to [localhost:8000](http://localhost:8000)

### DEPLOYING TO PRODUCTION

1. Compile code and commit changes to GitHub
2. GitHub Pages will automatically push changes from **master** branch to website
3. [View website](https://thaitwo.github.io/charts/) to confirm successful deployment