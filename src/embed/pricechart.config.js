/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  name: "pricechart", //must be unique to embeds
  files: {

    html: "src/embed/pricechart.html",
    loader: 'src/assets/images/paysharesThrobber.png',
    
    js: [  
      'bower_components/moment/moment.js',
      'bower_components/d3/d3.js',
      'deps/payshares-lib.js',
      'src/common/apiHandler.js',
      'src/common/priceChart.js',
      'src/embed/pricechart-script.js' 
      ],
    
    less: [
      'src/less/priceChart.less',
      'src/embed/pricechart.less', 
    ]
  }
};

