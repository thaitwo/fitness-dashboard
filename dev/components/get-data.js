class GetData {
  // @param (string)
  constructor(interval) {
    // this.weekly = ['5/1-5/7', '5/8-5/14', '5/15-5/21', '5/22-5/28', '5/29-6/4', '6/5-6/11'],
    // this.weeklyData = [61059, 71320, 81209, 61347, 51238, 61830],
    // this.monthly = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    // this.monthlyData = [61059, 71320, 81209, 61347, 51238, 61830, 71836, 71777, 81346, 72734, 82967, 78567],
    // this.yearly = ['2015', '2016', '2017'],
    // this.yearlyData = [61059, 71320, 81209];

    this.final;
    this.getData(interval);
  }

  getData(interval) {
    $.ajax({
      url: 'https://api.myjson.com/bins/ykvs3',
      dataType: 'json',
      success: (data) => {
        switch(interval) {
          case 'daily':
            this.dailyData(data);
            break;
          case 'weekly':
            break;
        }
      }
      //this.dailyData.bind(this)
    })
  }

  dailyData(data) {
    this.final = data.activity.map((day) => {
      return day.steps;
    })
    console.log('FINAL ARR', this.final);
    return this.final;
  }
}

export default GetData;

// Event handler - retrieve new data and update each time menu item is selected
    // Make request call to get data
    // Function that takes the new data and feed it to the updateGraph() function