import $ from 'jquery';
import store from 'store2';
import axios from 'axios';

class News {
  constructor(containerId, symbolArray, numOfArticlesPerStock) {
    this.$container = $(containerId);
    this.symbols = symbolArray;
    this.num = numOfArticlesPerStock;
    this.numOfStocks = symbolArray.length;

    this.fetchNews();
  }


  formatAxiosRequests() {
    return this.symbols.map((symbol) => {
      return axios.get(`https://cloud.iexapis.com/v1/stock/${symbol}/news/last/${this.num}?token=pk_a12f90684f2a44f180bcaeb4eff4086d`);
    });
  }


  fetchNews() {
    if (store.get('homeNews') !== null) {
      this.renderNews();
    } else {
      const requests = this.formatAxiosRequests();
      
      axios.all(requests)
      .then(axios.spread((symbol1, symbol2, symbol3, symbol4, symbol5) => {
        const newsArticles = [
          {articles: symbol1.data},
          {articles: symbol2.data},
          {articles: symbol3.data},
          {articles: symbol4.data},
          {articles: symbol5.data},
        ];

        store.set('homeNews', newsArticles);
      }))
      .catch(error => console.log(error))
      .finally(() => {
        this.renderNews();
      })
    }
  }


  renderNews() {
    const newsArticlesData = store.get('homeNews');
    this.$container.append('<ul class="home-news"></ul>')
    
    const articles = newsArticlesData.map((company) => {
      const article = company.articles[0];
      const headline = article.headline;
      const image = article.image;
      const source = article.source;
      const url = article.url;

      return `
        <li>
          <a href="${url}" target="_blank">
            <div>
              <img src="${image}" class="news-image" onerror="this.onerror=null;this.src='https://www.dcsltd.co.uk/wp-content/themes/dcs/images/ui.news-image-placeholder.jpg';" />
            </div>
            <div class="news-text-content">
              <h3 class="news-headline">${headline}</h3>
              <p class="news-source">${source}</p>
            </div>
          </a>
        </li>
      `;
    });

    
    $('.home-news').append(articles);
  }
}

export default News;