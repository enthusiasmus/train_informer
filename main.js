var oebb = require("oebb-api");
var LCD = require("lcd");

var trainInformator = {
	lcd: new Lcd({rs: 26, e: 24, data: [12, 16, 18, 22], cols: 16, rows: 2}),
  queryDepartures: function(){
    oebb.searchStationsNew("xxx").then((res)=>{
        var from=res[0];
        oebb.searchStationsNew("xxx").then((res)=>{
            var to = res[0];
            oebb.getJourneys(from, to, true).then((res)=>{
              trainInformator.writeToLCD(trainInformator.parse(res.connections));
            });
        })
    });
  },
  parse: function(connections){
    var result = [];

    for(var connection of connections){
      var from = connection.connection.from;
      var departure = new Date(from["departure"]);
      var current = new Date();
      var difference = Math.abs(departure.getTime() - current.getTime());
      var differenceMinutes = Math.floor(difference / 1000 / 60);

      result.push(differenceMinutes + "'G" + from["departurePlatform"]);
    }

    return result;
  },
  writeToLCD: function(departures) {
	  trainInformator.lcd.setCursor(0, 0);
    trainInformator.lcd.print(departures.slice(0, 3), trainInformator.errorCallback);

    trainInformator.lcd.setCursor(0, 1);
    trainInformator.lcd.print(departures.slice(3, 6), trainInformator.errorCallback);
  },
  errorCallback: function(error) {
    if (error) {
      throw error;
    }
  }
}

trainInformator.lcd.on("ready", function () {
  setInterval(function () {
    trainInformator.queryDepartures();
  }, 1000*60);
});

trainInformator.queryDepartures();

process.on("SIGINT", function () {
  trainInformator.lcd.close();
  process.exit();
});
