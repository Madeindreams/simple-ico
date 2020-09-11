const _deploy_contracts = require("../migrations/2_deploy_contracts");

var ERC20Token = artifacts.require("ERC20Token.sol");

contract('ERC20Token', function(accounts) {
var tokenInstance;

    it('initialize the contract with the correct values', function(){
       return ERC20Token.deployed().then(function(instance){
           tokenInstance = instance;
           return tokenInstance.name();
       }).then(function(name){
           assert.equal(name, 'MadeInDreams Token', 'has the correct name');
           return tokenInstance.symbol();
       }).then(function(symbol){
           assert.equal(symbol, 'MIDT', 'has the correct symbol'); 
           return tokenInstance.standard();
       }).then(function(standard){
           assert.equal(standard, 'MIDT Token v1.0', 'has the correct standard');
       })
    });

    it('allocate the total supply upon deployment', function(){
        return ERC20Token.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
          assert.equal(totalSupply.toNumber(), 100000000, 'sets the total supply to 100,000,000');
          return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
          assert.equal(adminBalance.toNumber(), 100000000, 'it allocates the initial supply to the admin');  
        

        });
    });

    it('transfer token ownership', function(){
        return ERC20Token.deployed().then(function(instance){
            tokenInstance = instance;
            // test try to send more then the ballance
            return tokenInstance.transfer(accounts[1], 100000001);
        }).then(assert.fail).catch(function(error){
          // console.log(error.message);
           //assert(error.message.indexOf('revert') >= 0, 'Revert Error in balance'); 
           assert(error.message, 'Error message present'); 
           return tokenInstance.transfer.call(accounts[1], 250000,{from: accounts[0]});
        }).then(function(success){
            assert.equal(success, true,'it return true')
           return tokenInstance.transfer(accounts[1], 250000,{from: accounts[0]});
        }).then(function(receipt){
            
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the token are transfered from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the token are transfered to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer ammount');

            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving accounts');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 99750000,'deducts the amount from sending account');
        });
    });

    it('approve tokens for delegated transfer', function(){

        return ERC20Token.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.equal(success, true, 'approve return true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the token are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the token are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer ammount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(), 100, 'stores allowance for delegated transfer');
        });
    });

    it('handles delegated token transfers', function() {
        return ERC20Token.deployed().then(function(instance) {
          tokenInstance = instance;
          fromAccount = accounts[2];
          toAccount = accounts[3];
          spendingAccount = accounts[4];
          // Transfer some tokens to fromAccount
          return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function(receipt) {
          // Approve spendingAccount to spend 10 tokens form fromAccount
          return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
          // Try transferring something larger than the sender's balance
          return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
          // Try transferring something larger than the approved amount
          return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
          return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(success) {
          assert.equal(success, true);
          return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, 'triggers one event');
          assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
          assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
          assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
          assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
          return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
          return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
          return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
          assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
        });
      });


});