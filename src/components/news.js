import $ from 'jquery';
import store, { local } from 'store2';
import axios from 'axios';

// issue: can't retrieve news data for specific symbol
class News {
  constructor(containerId, symbolArray, localStorageKey, numOfArticlesPerStock = 5) {
    this.$container = $(containerId);
    this.symbols = symbolArray;
    this.num = numOfArticlesPerStock;
    this.numOfStocks = symbolArray.length;
    this.localStorageKey = localStorageKey;

    this.fetchNews();
  }


  formatAxiosRequests() {
    return this.symbols.map((symbol) => {
      return axios.get(`https://cloud.iexapis.com/v1/stock/${symbol}/news/last/${this.num}?token=pk_a12f90684f2a44f180bcaeb4eff4086d`);
    });
  }


  fetchNews() {
    // If news data for stock exists in localStorage...
    if (store.get(this.localStorageKey) !== null) {
      this.renderNews();
    } else {
      const requests = this.formatAxiosRequests();
      
      axios.all(requests)
      .then(axios.spread((...response) => {
        const newsArticles = response.map((companyNews) => {
          return companyNews.data[0];
        })

        store.set(this.localStorageKey, newsArticles);
      }))
      .catch(error => console.log(error))
      .finally(() => {
        this.renderNews();
      })
    }
  }


  // RENDER NEWS ARTICLES
  renderNews() {
    let newsArticlesData;
    let articles;

    if (this.localStorageKey === 'homeNews') {
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