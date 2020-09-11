const ERC20Token = artifacts.require("ERC20Token");
const ERC20TokenSale = artifacts.require("ERC20TokenSale");

module.exports = function(deployer) {
    ///// Deploy Contract, Total Supply
  deployer.deploy(ERC20Token, 100000000).then(function(){
    // token price is 0.001 ETH Expressed in WEI
    var tokenPrice = 1000000000000000; 
  return deployer.deploy(ERC20TokenSale, ERC20Token.address, tokenPrice);
  });
  
};