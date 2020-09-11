// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;

import "./erc20Token.sol";

contract erc20TokenSale{

    address payable admin;
    erc20Token public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    event Sell(address _buyer, uint256 _amount);
    event EndSale(uint256 _totalAmountSold);

    constructor(erc20Token _tokenContract, uint256 _tokenPrice) {

// assing admin
admin = msg.sender;
tokenContract = _tokenContract;
tokenPrice = _tokenPrice;

    }

    // multiply
    function multiply(uint x, uint y) internal pure returns (uint z){
        require(y == 0 || (z = x * y) / y==x);
    }

function buyTokens(uint256 _numberOfTokens) public payable {

    
     require(msg.value == multiply(_numberOfTokens, tokenPrice), 'msg.value must equal number of tokens in wei');
     require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, 'cannot purchase more tokens than available');
     require(tokenContract.transfer(msg.sender, _numberOfTokens), 'Unable to send tokens');
     admin.transfer(address(this).balance);
 
    tokensSold += _numberOfTokens;

    emit Sell(msg.sender, _numberOfTokens);
}

function endSale() public payable{
require(msg.sender == admin);
require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
//Send ETH from sale to the admin
admin.transfer(address(this).balance);

emit EndSale(tokensSold);
}


}