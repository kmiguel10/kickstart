const routes = require("next-routes")(); //() at the end means it returns a function and gets invokes immidietaly after require

routes.add("/campaigns/new", "/campaigns/new");
//Add rule ':' indicates a wildcard
routes.add("/campaigns/:address", "/campaigns/show");

module.exports = routes; //exports helpers
