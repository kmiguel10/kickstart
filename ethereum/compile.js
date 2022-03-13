const path = require("path");
const solc = require("solc");
const fs = require("fs-extra"); //file system reader

//Note: When deploying make sure that solidity and solc versions must be the same

//Delete the entire build folders
const buildPath = path.resolve(__dirname, "build"); //find folder
fs.removeSync(buildPath); //remove and delete build

//Read contracts_director
const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol"); //find files
const source = fs.readFileSync(campaignPath, "utf8"); //specify encoding

//Use solidity compiler to compile
const output = solc.compile(source, 1).contracts;

//Re-build the build directory
fs.ensureDirSync(buildPath);

console.log(output);
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}
