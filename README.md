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
	- Comment out the `URL_BASE` and `API_TOKEN` variables under PRODUCTION ENVIRONMENT and uncomment the variables under SANDBOX ENVIRONMENT
	- This sandbox environment allows for unlimited calls to the API
	- NOTE: API calls will not work unless the `URL_BASE` and `API_TOKEN` variables are updated to the sandbox variables

2. Log into [IEX Cloud Console](https://iexcloud.io/console/)
	- On the left sidebar near the bottom, click on **SANDBOX TESTING**. The status should now read `ON`.
3. Go to terminal and from the root directory run `npm start`
4. To compile changes, run `npm run build`
5. Open browser to [localhost:8000](http://localhost:8000)

### DEPLOYING TO PRODUCTION

1. Compile code and commit changes to GitHub
2. GitHub Pages will automatically push changes from **master** branch to website
3. [View website](https://thaitwo.github.io/charts/) to confirm successful deployment