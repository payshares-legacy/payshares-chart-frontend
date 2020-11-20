/* config vars must be global */

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
      { host: 'live.payshares.org', port: 5015, secure: true }
    ],

    connection_offset: 0
  }
}
