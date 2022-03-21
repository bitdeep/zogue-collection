// testnet bsc
const mainAddress = '0x95B7FB1da941B6FD1952D85f2d762F11CB00E856';
let web3, account, main;

// hold both prices of a public and whitelisted mint
let PRESALE_PRICE,
    PUBLIC_SALE_PRICE;

function fromWei(v) {
    return web3.utils.fromWei(v);
}
function toWei(v) {
    return web3.utils.toWei(v);
}
async function accountLoad() {
    if (window.ethereum) {
        const r = await window.ethereum.request({method: 'eth_requestAccounts'});
        web3 = new Web3(window.ethereum);
        account = r[0];
        return true;
    }
    return false;
}

async function load() {
    const enabled = await accountLoad();
    if (enabled) {
        $('#WALLET').html(account);
        main = new web3.eth.Contract(abi_main, mainAddress);
        contractStats();
    } else {
        alert('no web3 connection');
    }
}

async function contractStats(){
    const PRESALE_ACTIVE = await main.methods.PRESALE_ACTIVE().call();
    $('#PRESALE_ACTIVE').css('display', PRESALE_ACTIVE?'':'none');

    const SALE_ACTIVE = await main.methods.SALE_ACTIVE().call();
    $('#SALE_ACTIVE').css('display', SALE_ACTIVE?'':'none');

    PRESALE_PRICE = await main.methods.PRESALE_PRICE().call();
    $('#PRESALE_PRICE').html(PRESALE_PRICE/1e18);

    PUBLIC_SALE_PRICE = await main.methods.PUBLIC_SALE_PRICE().call();
    $('#PUBLIC_SALE_PRICE').html(PUBLIC_SALE_PRICE/1e18);

    /*

    const name = await main.methods.name().call();
    $('#name').html(name);

    const symbol = await main.methods.symbol().call();
    $('#symbol').html(symbol);

    const FEE_RECIPIENT = await main.methods.FEE_RECIPIENT().call();
    $('#FEE_RECIPIENT').html(FEE_RECIPIENT);

    const totalSupply = await main.methods.totalSupply().call();
    $('#totalSupply').html(totalSupply);

    const accountWhitelisted = await main.methods.presaleWhitelist(account).call();
    $('#accountWhitelisted').html(accountWhitelisted?'Yes':'No');

    $('#minterAddress').val(account);
    */

    loadLastMintedNft();

}

async function onLoad(){
    load();

    // setInterval(pendingReward, 10000);
}
async function transferOwnership(newOwner){
    const tx = await admin.methods.transferOwnership(newOwner).send({from: account});
    $('#tx').html(tx.transactionHash);
    await load();
}

async function mintPresale(){
    const numberOfTokens = $('#numberOfTokensPreSale').val();
    const tx = await main.methods.mintPresale(numberOfTokens).send({from: account, value: PRESALE_PRICE});
    $('#tx').html(tx.transactionHash);
    await load();
}

async function mintPublic(){
    const numberOfTokens = $('#numberOfTokensPublic').val();
    const tx = await main.methods.mintPublic(numberOfTokens).send({from: account, value: PUBLIC_SALE_PRICE});
    $('#tx').html(tx.transactionHash);
    await load();
}

async function setWhitelist(){
    const minterAddress = $('#minterAddress').val();
    const tx = await main.methods.setWhitelist(minterAddress, true).send({from: account});
    $('#tx').html(tx.transactionHash);
    await load();
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
