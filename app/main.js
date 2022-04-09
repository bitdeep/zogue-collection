// testnet bsc
const mainAddress = '0x95B7FB1da941B6FD1952D85f2d762F11CB00E856';
let web3, account, main;

// hold both prices of a public and whitelisted mint
let PRESALE_PRICE,
    PUBLIC_SALE_PRICE;
let PRESALE_ACTIVE,
    SALE_ACTIVE;

function fromWei(v) {
    return web3.utils.fromWei(v);
}
function toWei(v) {
    return web3.utils.toWei(v);
}
let Web3Modal, web3Modal, provider;
async function onLoad(){
    const providerOptions = {};
    Web3Modal = window.Web3Modal.default;
    web3Modal = new Web3Modal({});
    provider = await web3Modal.connect();
    provider.on("accountsChanged", (accounts) => {
        console.log("accountsChanged", accounts);
        load(provider);
    });
    provider.on("chainChanged", (chainId) => {
        console.log("chainChanged", chainId);
        load(provider);
    });
    provider.on("connect", (info) => {
        console.log("connect", info);
        load(provider);
    });
    provider.on("disconnect", (error) => {
        console.log("disconnect", error);
        alert(error.message);
    });

    load(provider);
    // setInterval(pendingReward, 10000);
}

async function load(provider) {
    const enabled = await accountLoad(provider);
    if (enabled) {
        $('#WALLET').html(account);
        main = new web3.eth.Contract(abi_main, mainAddress);
        contractStats();
    } else {
        alert('no web3 connection');
    }
}

async function accountLoad(provider) {
    if (provider) {
        const r = await provider.request({method: 'eth_requestAccounts'});
        web3 = new Web3(provider);
        account = r[0];
        return true;
    }
    return false;
}

let presaleWhitelist;
async function contractStats(){
    try {
        presaleWhitelist = await main.methods.presaleWhitelist(account).call();
    }catch(e){
        alert('ERROR: CHANGE YOUR NETWORK TO BSC TESTNET.');
        return;
    }

    if( presaleWhitelist ){
        PRESALE_ACTIVE = await main.methods.PRESALE_ACTIVE().call();
        $('#PRESALE_ACTIVE').css('display', PRESALE_ACTIVE?'':'none');
    }else {
        SALE_ACTIVE = await main.methods.SALE_ACTIVE().call();
        $('#SALE_ACTIVE').css('display', SALE_ACTIVE ? '' : 'none');
    }

    PRESALE_PRICE = await main.methods.PRESALE_PRICE().call();
    $('#PRESALE_PRICE').html(PRESALE_PRICE/1e18);

    PUBLIC_SALE_PRICE = await main.methods.PUBLIC_SALE_PRICE().call();
    $('#PUBLIC_SALE_PRICE').html(PUBLIC_SALE_PRICE/1e18);



    loadLastMintedNft();

}

async function tokenURI(){
    const tokenURIInput = $('#tokenURIInput').val();
    const tokenURI = await main.methods.tokenURI(tokenURIInput).call();
    $('#tokenURI').html(tokenURI);
}

async function mintPresale(){
    const val = $('#inputPresale').val();
    const tx = await main.methods.mintPresale(val).send({from: account, value: PRESALE_PRICE});
    $('#tx').html(tx.transactionHash);
    await loadLastMintedNft();
}

async function mintPublic(){
    const val = $('#inputSale').val();
    const tx = await main.methods.mintPublic(val).send({from: account, value: PUBLIC_SALE_PRICE});
    $('#tx').html(tx.transactionHash);
    await loadLastMintedNft();
}
async function loadLastMintedNft(){
    let balanceOf = await main.methods.balanceOf(account).call();
    console.log('balanceOf', balanceOf);
    if( balanceOf == 0 ) return;
    --balanceOf;
    const tokenOfOwnerByIndex = await main.methods.tokenOfOwnerByIndex(account, balanceOf).call();
    const tokenURI = await main.methods.tokenURI(tokenOfOwnerByIndex).call();
    console.log('tokenURI', tokenURI);
    $.get(tokenURI, function(str){
        const r = JSON.parse(str);
        const name = r.name;
        const image = r.image;
        const html = `<h3 class="text-primary">${name}</h3><img src="${image}" height="480" class="shadow-lg  mb-5 bg-body rounded" />`;
        $('#tokenOfOwnerByIndex').html(html);
    });

}
