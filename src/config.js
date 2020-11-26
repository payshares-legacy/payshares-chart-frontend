/* config vars must be global */

Options = {
  theme     : "light",
  base      : {currency:"BTC", issuer:"x481ZDzTxWSybpWNxGcyTPF2WjiLjAqBut"},
  trade     : {currency:"XPS", issuer:""},
  chartType : "line",
  interval  : "1h",
 
  payshares    : {
    
    trace   : false,
    trusted : false,

    servers: [
      { host: 'one.vld.payshares.org', port: 5016, secure: true }
    ],

    connection_offset: 0
  }
}
