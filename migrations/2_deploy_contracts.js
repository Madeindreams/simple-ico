const ERC20Token = artifacts.require("./erc20Token.sol");
const ERC20TokenSale = artifacts.require("./erc20TokenSale.sol");

module.exports = function(deployer) {
    ///// Deploy Contract, Total Supply
  deployer.deploy(ERC20Token, 100000000).then(function(){
    // token price is 0.001 ETH Expressed in WEI
    var tokenPrice = 1000000000000000; 
  return deployer.deploy(ERC20TokenSale, ERC20Token.address, tokenPrice);
  });
  
};