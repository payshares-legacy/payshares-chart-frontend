angular.module( 'paysharescharts.multimarkets', [
  'ui.state',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'multimarkets', {
    url: '/multimarkets',
    views: {
      "main": {
        controller: 'MultimarketsCtrl',
        templateUrl: 'multimarkets/multimarkets.tpl.html'
      }
    },
    data:{ pageTitle: 'Multi Markets' }
  });
})

.controller( 'MultimarketsCtrl', function MultimarketsCtrl( $scope, $location ) {
  $scope.markets  = store.session.get('multimarkets') || 
    store.get('multimarkets') || 
    Options.multimarkets || [
    {
      base    : {currency:"XPS"},
      counter : {currency:"USD",issuer:"gDSSa75HPagWcvQmwH7D51dT5DPmvsKL4q"}},
    {
      base    : {currency:"XPS"},
      counter : {currency:"CNY",issuer:"rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"}},
    {
      base    : {currency:"BTC",issuer:"gDSSa75HPagWcvQmwH7D51dT5DPmvsKL4q"},
      counter : {currency:"XPS"}}
    ];
    
    
  var markets = new MultiMarket ({
    url            : API,  
    id             : "multimarkets",
    updateInterval : 60, //5 minutes
    clickable      : true
  });
  
  
  markets.list($scope.markets);
  markets.on('updateList', function(data){
    store.set('multimarkets', data);
    store.session.set('multimarkets', data);
  });
  
  markets.on('chartClick', function(chart){
    var path = "/markets/"+chart.base.currency+
      (chart.base.issuer ? ":"+chart.base.issuer : "")+
      "/"+chart.counter.currency+
      (chart.counter.issuer ? ":"+chart.counter.issuer : "");
    $location.path(path);
    $scope.$apply();  
  });
    
  $scope.$on("$destroy", function(){
    markets.list([]);
  });
  
})

;
