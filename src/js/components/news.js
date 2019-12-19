import $ from 'jquery';
import store, { local } from 'store2';
import axios from 'axios';
import { URL_BASE, API_TOKEN } from '../../const';

class News {
  constructor(containerId, symbolArray, localStorageKey, numOfArticlesPerStock = 5) {
    this.$container = $(containerId);
    this.symbols = symbolArray;
    this.num = numOfArticlesPerStock;
    this.numOfStocks = symbolArray.length;
    this.localStorageKey = localStorageKey;

    this.fetchNews();
  }


  // CREATE A REQUEST FOR EACH SYMBOL PROVIDED
  formatAxiosRequests() {
    return this.symbols.map((symbol) => {
      return axios.get(`${URL_BASE}/${symbol}/news/last/${this.num}?token=${API_TOKEN}`);
    });
  }


  // FETCH DATA FOR NEWS ARTICLES
  fetchNews() {
    // If news data for stock exists in localStorage...
    if (store.get(this.localStorageKey) !== null) {
      this.renderNews();
    } else {
      const requests = this.formatAxiosRequests();
      axios.all(requests)
      .then(axios.spread((...response) => {
        const newsArticles = response.map(companyNews => companyNews.data[0]);
        // Check that every requests returns a '200' status which means it's successful
        const allRequestsWork = response.every(article => article.status == 200);

        store.set(this.localStorageKey, newsArticles);

        // Only render news articles if all the requests are successful
        if (allRequestsWork) {
          this.renderNews();
        }
      }))
      .catch(error => console.log(error.response.data.error))
    }
  }


  // RENDER NEWS ARTICLES
  renderNews() {
    let newsArticlesData;
    let articles;

    if (this.localStorageKey === 'home-news') {
      newsArticlesData = store.get(this.localStorageKey);
    } else {
      newsArticlesData = store.get(this.localStorageKey).news;
    }

    this.$container.empty();
    this.$container.append('<h2 class="text-header">Latest News</h2><ul class="news-list"></ul>');

    // If there are articles...
    if (newsArticlesData.length) {
      articles = newsArticlesData.map((article) => {
        const headline = article.headline;
        const source = article.source;
        const url = article.url;
        const dateInstance = new Date(article.datetime);
        const month = dateInstance.getMonth();
        const date = dateInstance.getDay();
        const year = dateInstance.getFullYear();
  
        return `
          <li>
            <a href="${url}" target="_blank">
              <div class="news-text-content">
                <h3 class="news-headline">${headline}</h3>
                <p class="news-source">${source} - ${month}/${date}/${year}</p>
              </div>
            </a>
          </li>
        `;
      });
    } else {
      articles = `
        <li>
          <p class="news-no-articles">There are currently no articles for this stock.</p>
        </li>
      `;
    }

    $('.news-list').empty();
    $('.news-list').append(articles);
  }
}

export default News;