App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold:0,
    tokensAvailable:750000,


    init: function(){
        console.log('App Initialization');
        return App.initWeb3();
    },

    initWeb3: function(){
        if (typeof web3 !== 'undefined'){
            // if a web3 instance is already provided by MetaMask
            App.web3Provider = web3.currentProvider;
            ethereum.autoRefreshOnNetworkChange = false;
            web3 = new Web3(web3.currentProvider);
            //window.ethereum.enable();
            ethereum.send('eth_requestAccounts');
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
            
        }
        
        return App.initContracts();
    },
    initContracts: function() {
        $.getJSON("erc20TokenSale.json", function(tokenSale){
            App.contracts.tokenSale = TruffleContract(tokenSale);
            App.contracts.tokenSale.setProvider(App.web3Provider);
            App.contracts.tokenSale.deployed().then(function(tokenSale){
                console.log("MIDT Contract Adress: ",tokenSale.address);
            });
        }).done(function(){
                $.getJSON("erc20Token.json", function(agcToken){
                    App.contracts.agcToken = TruffleContract(agcToken);
                    App.contracts.agcToken.setProvider(App.web3Provider);
                    App.contracts.agcToken.deployed().then(function(agcToken){
                        console.log("MIDT Address: ",agcToken.address);
                        });
                        App.listenForEvents();
                        return App.render();
                       
                });
               
            })
            
     },
     listenForEvents: function(){
         App.contracts.tokenSale.deployed().then(function(instance){
             instance.Sell({}, {
                 fromBlock: 0,
                 toBlock: 'latest',
             }).watch(function(error, event){
               //  console.log("event triggered", event);
                 App.render();
             })
         })

     },

     render: function() {
         if (App.loading){
             return;
         }
         // content visibility while loading
         App.loading = true;
         var loader = $('#loader');
         var content = $('#content');

         loader.show();
         content.hide();

         // loading account data
         web3.eth.getCoinbase(function(err, account) {
             if(err === null) {
                 App.account = account;
                 console.log(web3.eth.coinbase);
                 console.log("account: ", account);
                 $('#accountAddress').html("Your Account: " + account);
             }
         })

         //////////Load Token Sale Contract
         App.contracts.tokenSale.deployed().then(function(instance){
             tokenSaleInstance = instance;
             return tokenSaleInstance.tokenPrice();
         }).then(function(tokenPrice){
            console.log("Token Price ",web3.fromWei(App.tokenPrice, "ether") + " Ether");
           // console.log(web3.fromWei(App.tokenPrice, "ether"));
            App.tokenPrice=tokenPrice.toNumber();
             $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
           // console.log("Token Price" ,App.tokenPrice)
           return tokenSaleInstance.tokensSold();
         }).then(function(tokensSold){
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);
            var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
            $('#progress').css('width',progressPercent +'%');
            //console.log(progressPercent);
        
            ////////Load Token Contract
            App.contracts.agcToken.deployed().then(function(instance){
                tokenInstance = instance;
                return tokenInstance.balanceOf(App.account);
            }).then(function(balance){
                $('.agct-balance').html(balance.toNumber()+' ');

                App.loading = false;
                loader.hide();
                content.show();
            });
         });

    },

    buyTokens: function(){
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.tokenSale.deployed().then(function(instance){
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas:500000
            });
        }).then(function(result){
            console.log("Token bought ...");
          //  $('form').trigger('reset');
           
        });
    }
}

$(function(){
    $(window).load(function() {
       App.init();
    })
});