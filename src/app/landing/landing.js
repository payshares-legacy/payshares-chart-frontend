angular.module( 'stellarcharts.landing', [
  'ui.state'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'landing', {
    url: '/',
    views: {
      "main": {
        controller: 'LandingCtrl',
        templateUrl: 'landing/landing.tpl.html'
      }
    },
    data:{ }
  });
})

.controller( 'LandingCtrl', function LandingCtrl( $scope, $rootScope, $location ) {

  var api   = new ApiHandler(API);
  var donut = new ValueSummary({id:"metricDetail"});

  var exchangeRates   = {};
  var valueCurrencies = {
    "BTC" : "gPwGQjiEZRy9k81qcFExHYvJ5Wf4qTna1c", //OneCred
    "USD" : "gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K", //Coinex
    "CNY" : "gP1f4UKHbvdNDZPYyjqFHTnaqGzCwyjm5E", //RippleFox
    "NZD" : "gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K", //Coinex
    "AUS" : "gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K"  //Coinex
  };
  
  var totalAccounts
  var totalNetworkValueSTR;
  var transactionVolumeSTR;
  var tradeVolumeSTR;
  
  $scope.valueRate;
  $scope.valueCurrency     = "BTC";
  $scope.metricDetail      = "tradeVolume";
  $scope.metricDetailTitle = "Trade Volume (last 24 hours)";

  //dropdown to change currency for metrics  
  var valueSelect = d3.select("#valueCurrency")
    .on("change", function(){
      var currency = this.value;
      setValueRate(currency, true, function(err){
        $scope.valueCurrency = currency;
        showValue("totalNetworkValue");  
        showValue("transactionVolume");  
        showValue("tradeVolume");  
      });   
    });
    
  valueSelect.selectAll("option")
    .data(d3.keys(valueCurrencies))
    .enter().append("option")
    .html(function(d){return d})
    .attr("selected", function(d) {if (d == $scope.valueCurrency.currency) return true});
     
  //remote.on('transaction_all', feed.handleTransaction); //display transaction feed
  remote.on('transaction_all', handleNewAccount); //add to new accounts total
  
  remote.on("connect", function(){
    getTotalAccounts();  //we want to retreive this number every time we reconnect
  });
  
  if (remote._connected) getTotalAccounts();
  
   
  //get "fixed" multimarket charts for the most important markets  
  var markets = new MultiMarket ({
    url            : API,  
    id             : "topMarkets",
    fixed          : true,
    clickable      : true,
    updateInterval : 60 //1 minute
  });
  
  
  markets.list([
    {
      counter : {currency:"STR"},
      base    : {currency:"BTC", issuer:"gPwGQjiEZRy9k81qcFExHYvJ5Wf4qTna1c"}
    },
    {
      counter : {currency:"STR"},
      base    : {currency:"BTC", issuer:"gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K"}
    }, {
      counter : {currency:'STR'},
      base    : {currency:'USD', issuer:'gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K'}
    }, {
      counter : {currency:"STR"},
      base    : {currency:"CNY", issuer:"gP1f4UKHbvdNDZPYyjqFHTnaqGzCwyjm5E"}
    }, {
      counter : {currency:'STR'},
      base    : {currency:'NZD', issuer:'gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K'}
    }, {
      counter : {currency:"STR"},
      base    : {currency:"AUD", issuer:"gs9HHU3pmkKBuvykhNm6xiK1JKrput9i3K"}
    }
    ]);


  markets.on('chartClick', function(chart){
    var path = "/markets/"+chart.base.currency+
      (chart.base.issuer ? ":"+chart.base.issuer : "")+
      "/"+chart.counter.currency+
      (chart.counter.issuer ? ":"+chart.counter.issuer : "");
    $location.path(path);
    $scope.$apply();  
  });
  
      
  //show the helper text the first time we visit the page               
  if (!store.get("returning")) setTimeout(function(){
    d3.select("#helpButton").node().click();
  }, 100);
  
  $scope.$watch('metricDetail', function(){

    var ex = {rate:$scope.valueRate, currency:$scope.valueCurrency};
    
    if      ($scope.metricDetail == 'totalNetworkValue') {
      $scope.metricDetailTitle = "Total Network Value";
      donut.load(totalNetworkValueSTR, ex, true);
    } else if ($scope.metricDetail == 'transactionVolume') {
      $scope.metricDetailTitle = "Transaction Volume (last 24 hours)";
      donut.load(transactionVolumeSTR, ex);
    } else if ($scope.metricDetail == 'tradeVolume') {
      $scope.metricDetailTitle = "Trade Volume (last 24 hours)";
      donut.load(tradeVolumeSTR, ex); 
    }
  });
  
  //stuff to do when leaving the page   
  $scope.$on("$destroy", function(){
    markets.list([]); //this will disable the update listeners for the charts
    
    if (!store.get("returning") &&
      $scope.showHelp) setTimeout(function(){
        d3.select("#helpButton").node().click();
      }, 50);
      
    store.set("returning", true);
    clearInterval(valueInterval);
  });

  
  //get num accounts
  function getTotalAccounts () {
    api.getTotalAccounts(null, function(err, total){
      if (err) console.log(err);

      if (total) totalAccounts = total; //save for new account updates;
      $scope.totalAccounts = total ? commas(total) : " ";
      $scope.$apply();
      
    });    
  }
  
  //look for new accounts from the websocket feed  
  function handleNewAccount (tx) {
    var meta = tx.meta;
    if (meta.TransactionResult !== "tesSUCCESS") return;
    
    meta.AffectedNodes.forEach( function( affNode ) {
      
      if (affNode.CreatedNode && 
          affNode.CreatedNode.LedgerEntryType === "AccountRoot" ) {

          $scope.totalAccounts = totalAccounts ? commas(++totalAccounts) : " ";
          $scope.$apply();
      }
    });    
  } 

  //display the selected metric on the page, if its ready
  function showValue (metric) {
    var ex = {rate:$scope.valueRate, currency:$scope.valueCurrency},
      sign, value, precision;
    
  if (typeof $scope.valueRate === 'undefined') return;

    if (metric=="totalNetworkValue") {
      if (typeof totalNetworkValueSTR === 'undefined') return;
      if (metric === $scope.metricDetail) donut.load(totalNetworkValueSTR, ex, true);
      value     = totalNetworkValueSTR.total/$scope.valueRate; 
      precision = 0;
    
    } else if (metric=="transactionVolume") {
      if (typeof transactionVolumeSTR === 'undefined') return;
      if (metric === $scope.metricDetail) donut.load(transactionVolumeSTR, ex);
      value     = transactionVolumeSTR.total/$scope.valueRate;
      precision = 2;             
    } else if (metric=="tradeVolume") {
      if (typeof tradeVolumeSTR === 'undefined') return;      
      if (metric === $scope.metricDetail) donut.load(tradeVolumeSTR, ex);
      value     = tradeVolumeSTR.total/$scope.valueRate;     
      precision = 2;
    } 
    
    switch ($scope.valueCurrency) {
      case "USD": sign = "$"; break;
      case "JPY": sign = "¥"; break;
      case "CNY": sign = "¥"; break;
      case "EUR": sign = "€"; break;
      case "STR": sign = "";  break;
      default   : sign = "";  break;
    }      
      
    $scope[metric] = value ? sign+commas(value, precision) : " ";
    $scope.$apply();    
  }
   
   
  //get values for the various metrics
  function getValues() {
    
    setValueRate($scope.valueCurrency, false, function(err){
      //console.log($scope.valueRate);
      showValue("totalNetworkValue");  
      showValue("transactionVolume");  
      showValue("tradeVolume");  
    });
        
    api.getNetworkValue (null, function(err, data){
      if (err) {
        console.log(err);
        data = {total:0};
      }
      
      totalNetworkValueSTR = data;
      showValue("totalNetworkValue");          
    });
    
    api.getVolume24Hours(null, function(err, data){
      if (err) {
        console.log(err);
        data = {total:0};
      }
      
      transactionVolumeSTR = data;
      showValue("transactionVolume");                
    });
    
    api.getTopMarkets(null, function(err, data){
      if (err) {
        console.log(err);
        data = {total:0};
      }
      
      tradeVolumeSTR = data;
      showValue("tradeVolume");    
    });
  }
 
  //set the value rate for the selected currency, retreiving it from the 
  //API if its not cached or if we are updating the cache
  function setValueRate (currency, useCached, callback) {
    var issuer = valueCurrencies[currency];
    
    if (currency == "STR") {
      $scope.valueRate = 1;
      $scope.valueRateDisplay = "";
      return callback();
    }
    
    //check for cached
    if (useCached && exchangeRates[currency+"."+issuer]) {
      $scope.valueRate = exchangeRates[currency+"."+issuer];
      $scope.valueRateDisplay = commas(1/$scope.valueRate,4)  + " STR/"+currency;
      return callback();
    }
    

    getExchangeRate ({
      currency : currency,
      issuer   : issuer
    }, function(err) {
      if (err) {
        console.log(err);
        $scope.valueRate = 0;
        return callback(err);
      }
            
      $scope.valueRate = exchangeRates[currency+"."+issuer] || 0;
      if ($scope.valueRate) $scope.valueRateDisplay = commas(1/$scope.valueRate,4) + " STR/"+currency;
      callback();
    });     
  }
  
  
  //get the exchange rate from the API
  function getExchangeRate (c, callback) {
    
    api.exchangeRates({
      pairs:[{
        base    : {currency : c.currency, issuer : c.issuer},
        counter : {currency:"STR"}
      }]
      
    }, function(err, data){
      if (err) return callback(err);
      
      //cache for future reference
      data.forEach(function(d){
        exchangeRates[d.base.currency+"."+d.base.issuer] = d.rate;
      }); 
      
      callback(null, data);
    });
  }
  
  
  //get value metrics at load time and every 5 minutes
  getValues();
  var valueInterval = setInterval (getValues, 300000);
});

