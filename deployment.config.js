var grunt = require('grunt');

var environments = grunt.file.readJSON('deployment.environments.json');

var envCfg = function(environment) {
  console.log("Using environment " + environment + " for deployment, if invoked.");
  return environments[environment];
}

module.exports = function(env) {
  var config = envCfg(env);
  return {
    api         : config.api         ? config.api : "",
    mixpanel    : config.mixpanel    ? config.mixpanel : "",
    ga_account  : config.ga_account  ? config.ga_account : "",
    ga_id       : config.ga_id       ? config.ga_id  : "",
    domain      : config.domain      ? config.domain : "",
    maintenance : config.maintenance ? true : false
  };
}
