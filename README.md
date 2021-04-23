# A Simple ICO
This is the repo for the Madeindreams Decentralized Traceability Network


## Transfer tokens to the ICO contract

- Truffle console command for local deployment with ganache

In the terminal, type "truffle console"

- Set erc20tokenSale contract instance;

```erc20TokenSale.deployed().then(function(i){tokenSale=i;})```

```tokeSale```

- Set erc20token contract instance;

```erc20Token.deployed().then(function(i){token=i;})```

```token```

- Define the amount and make the transfer

```tokensAvailable = 10000000```

```admin = (await web3.eth.getAccounts())[0]```

```token.transfer(tokenSale.address, tokensAvailable, { from: admin })```
