/* config vars must be global */

//API      = "" //moved to deployment.environments.json; 
//MIXPANEL = "" //moved to deployment.environments.json;

Options = {
  theme     : "light",
  base      : {currency:"BTC", issuer:"gDSSa75HPagWcvQmwH7D51dT5DPmvsKL4q"},
  trade     : {currency:"XPR", issuer:""},
  chartType : "line",
  interval  : "1h",
 
  payshares    : {
    
    trace   : false,
    trusted : false,

    servers: [
      { host: 'live.payshares.co', port: 5015, secure: true }
    ],

    connection_offset: 0
  }
}