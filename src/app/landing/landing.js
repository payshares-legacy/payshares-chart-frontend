angular.module( 'paysharescharts.landing', [
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
    "BTC" : "x481ZDzTxWSybpWNxGcyTPF2WjiLjAqBut", //OneCred
    "USD" : "xHnuiZT5GHPKct16Vw6Yc1XEJxjeXp8twW", //Coinex
    "CNY" : "xNreXfour4tREhEBDUeExyCzjTdQSZ5BmQ", //RippleFox
    "NZD" : "xp4BoSZP21NyZ6D3WxUbGs15JDCPRHxeix", //Coinex
    "AUS" : "xKZwTZwA9f6McQ8f9SXMGSQmMcuQePvESU"  //Coinex
  };
  
  var totalAccounts
  var totalNetworkValueXPS;
  var transactionVolumeXPS;
  var tradeVolumeXPS;
  
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
      counter : {currency:"XPS"},
      base    : {currency:"BTC", issuer:"x481ZDzTxWSybpWNxGcyTPF2WjiLjAqBut"}
    },
    {
      counter : {currency:"XPS"},
      base    : {currency:"BTC", issuer:"xHnuiZT5GHPKct16Vw6Yc1XEJxjeXp8twW"}
    }, {
      counter : {currency:'XPS'},
      base    : {currency:'USD', issuer:'xNreXfour4tREhEBDUeExyCzjTdQSZ5BmQ'}
    }, {
      counter : {currency:"XPS"},
      base    : {currency:"CNY", issuer:"xp4BoSZP21NyZ6D3WxUbGs15JDCPRHxeix"}
    }, {
      counter : {currency:'XPS'},
      base    : {currency:'NZD', issuer:'xKZwTZwA9f6McQ8f9SXMGSQmMcuQePvESU'}
    }, {
      counter : {currency:"XPS"},
      base    : {currency:"AUD", issuer:"xPZfaSLhFBZ81Qjgts19yWEs15nFqt79Vc"}
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
      donut.load(totalNetworkValueXPS, ex, true);
    } else if ($scope.metricDetail == 'transactionVolume') {
      $scope.metricDetailTitle = "Transaction Volume (last 24 hours)";
      donut.load(transactionVolumeXPS, ex);
    } else if ($scope.metricDetail == 'tradeVolume') {
      $scope.metricDetailTitle = "Trade Volume (last 24 hours)";
      donut.load(tradeVolumeXPS, ex); 
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
      if (typeof totalNetworkValueXPS === 'undefined') return;
      if (metric === $scope.metricDetail) donut.load(totalNetworkValueXPS, ex, true);
      value     = totalNetworkValueXPS.total/$scope.valueRate; 
      precision = 0;
    
    } else if (metric=="transactionVolume") {
      if (typeof transactionVolumeXPS === 'undefined') return;
      if (metric === $scope.metricDetail) donut.load(transactionVolumeXPS, ex);
      value     = transactionVolumeXPS.total/$scope.valueRate;
      precision = 2;             
    } else if (metric=="tradeVolume") {
      if (typeof tradeVolumeXPS === 'undefined') return;      
      if (metric === $scope.metricDetail) donut.load(tradeVolumeXPS, ex);
      value     = tradeVolumeXPS.total/$scope.valueRate;     
      precision = 2;
    } 
    
    switch ($scope.valueCurrency) {
      case "USD": sign = "$"; break;
      case "JPY": sign = "¥"; break;
      case "CNY": sign = "¥"; break;
      case "EUR": sign = "€"; break;
      case "XPS": sign = "";  break;
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
      
      totalNetworkValueXPS = data;
      showValue("totalNetworkValue");          
    });
    
    api.getVolume24Hours(null, function(err, data){
      if (err) {
        console.log(err);
        data = {total:0};
      }
      
      transactionVolumeXPS = data;
      showValue("transactionVolume");                
    });
    
    api.getTopMarkets(null, function(err, data){
      if (err) {
        console.log(err);
        data = {total:0};
      }
      
      tradeVolumeXPS = data;
      showValue("tradeVolume");    
    });
  }
 
  //set the value rate for the selected currency, retreiving it from the 
  //API if its not cached or if we are updating the cache
  function setValueRate (currency, useCached, callback) {
    var issuer = valueCurrencies[currency];
    
    if (currency == "XPS") {
      $scope.valueRate = 1;
      $scope.valueRateDisplay = "";
      return callback();
    }
    
    //check for cached
    if (useCached && exchangeRates[currency+"."+issuer]) {
      $scope.valueRate = exchangeRates[currency+"."+issuer];
      $scope.valueRateDisplay = commas(1/$scope.valueRate,4)  + " XPS/"+currency;
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
      if ($scope.valueRate) $scope.valueRateDisplay = commas(1/$scope.valueRate,4) + " XPS/"+currency;
      callback();
    });     
  }
  
  
  //get the exchange rate from the API
  function getExchangeRate (c, callback) {
    
    api.exchangeRates({
      pairs:[{
        base    : {currency : c.currency, issuer : c.issuer},
        counter : {currency:"XPS"}
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

