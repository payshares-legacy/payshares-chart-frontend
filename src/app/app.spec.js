describe( 'AppCtrl', function() {
  
  it ( 'should have Options defined', inject( function(){
    expect (Options).not.toBeUndefined();
  })); 
  
  it ( 'should have Options.payshares defined', inject( function(){
    expect (Options.payshares).not.toBeUndefined();
  })); 
  
  it ( 'should have Options.payshares.servers defined', inject( function(){
    expect (Options.payshares.servers).not.toBeUndefined();
  })); 

  it ( 'should have Options.payshares.servers defined', inject( function(){
    expect (Options.payshares.servers[0].host).not.toBeUndefined();
  }));

        
  describe( 'isCurrentUrl', function() {
    var AppCtrl, $location, $scope;
  
    beforeEach( module( 'paysharescharts' ) );

    beforeEach( inject( function( $controller, _$location_, $rootScope ) {
      $location = _$location_;
      $scope = $rootScope.$new();
      AppCtrl = $controller( 'AppCtrl', { $location: $location, $scope: $scope });
    }));

    //it( 'should pass a dummy test', inject( function() {
    //  expect( AppCtrl ).toBeTruthy();
    //}));
  });
});
