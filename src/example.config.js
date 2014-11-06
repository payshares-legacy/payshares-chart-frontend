/* config vars must be global */

//API      = "" //moved to deployment.environments.json; 
//MIXPANEL = "" //moved to deployment.environments.json;

Options = {
  theme     : "light",
  base      : {currency:"BTC", issuer:"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"},
  trade     : {currency:"XRP", issuer:""},
  chartType : "line",
  interval  : "1h",
 
  stellar    : {
    
    trace   : false,
    trusted : false,

    servers: [
      { host: 'live.stellar.org', port: 9001, secure: true }
    ],

    connection_offset: 0
  }
}