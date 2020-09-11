# Traceability-DApp
A traceability DApp










# Truffle console command for local deployment with ganache

In the terminal, type "truffle console"

Set erc20tokenSale contract instance;

erc20TokenSale.deployed().then(function(i){tokenSale=i;})

Verify;

tokeSale

Set erc20token contract instance;

erc20Token.deployed().then(function(i){token=i;})

Verify;

token

Set the ammont of available tokens for erc20tokenSale

tokensAvailable = 10000000

Set the admin account;

admin = (await web3.eth.getAccounts())[0]

Transfer tokens to the erc20TokenSale Contract

token.transfer(tokenSale.address, tokensAvailable, { from: admin })