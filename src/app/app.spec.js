describe( 'AppCtrl', function() {
  
  it ( 'should have Options defined', inject( function(){
    expect (Options).not.toBeUndefined();
  })); 
  
  it ( 'should have Options.stellar defined', inject( function(){
    expect (Options.stellar).not.toBeUndefined();
  })); 
  
  it ( 'should have Options.stellar.servers defined', inject( function(){
    expect (Options.stellar.servers).not.toBeUndefined();
  })); 

  it ( 'should have Options.stellar.servers defined', inject( function(){
    expect (Options.stellar.servers[0].host).not.toBeUndefined();
  }));

        
  describe( 'isCurrentUrl', function() {
    var AppCtrl, $location, $scope;
  
    beforeEach( module( 'stellarcharts' ) );

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
