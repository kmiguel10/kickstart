import web3 from "./web3";
import campaignFactory from "./build/Factory.json"; //import the compiled factory contract

//this is the deployed factory instance - so we can access this instance from anywhere in the application
const instance = new web3.eth.Contract(
  JSON.parse(campaignFactory.interface),
  "0x25f54C54Fb8eBC3f674BB58a9659478d4dF4D944"
);

export default instance;
