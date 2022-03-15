const routes = require("next-routes")(); //() at the end means it returns a function and gets invokes immidietaly after require

routes.add("/campaigns/new", "/campaigns/new");
routes.add("/campaigns/:address", "/campaigns/show"); //Add rule ':' indicates a wildcard
//Add rule to navigate to campaign requests
routes.add("/campaigns/:address/requests", "/campaigns/requests/index");

module.exports = routes; //exports helpers
