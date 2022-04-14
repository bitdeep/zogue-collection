import {useEffect, useState} from 'react';
import './App.css';
import contract from './contracts/NFTCollectible.json';
import logo from './logo.png'
import Web3 from "web3";
import Web3Modal from "web3modal";
import Authereum from "authereum";
import WalletConnectProvider from "@walletconnect/web3-provider";

import {Container, Row, Col} from "react-bootstrap";

const contractAddress = "0x95B7FB1da941B6FD1952D85f2d762F11CB00E856";
const abi = contract.abi;
let web3, ethereum, account, main;

function App() {

    const [currentAccount, setCurrentAccount] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [displayPrice, setDisplayPrice] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);
    const [mintAlert, setMintAlert] = useState('');
    const [mintAmount, setMintAmount] = useState(1);
    const [presaleActive, setPresaleActive] = useState(false);
    const [saleActive, setSaleActive] = useState(false);
    const [presaleWhitelist, setPresaleWhitelist] = useState(false);
    const [lastMint, setLastMint] = useState(logo);
    const [weiPrice, setWeiPrice] = useState(0);
    const [TOTAL_SUPPLY, setTOTAL_SUPPLY] = useState(0);

    const checkWalletIsConnected = async () => {
        ethereum = await getweb3();
        if (!ethereum) {
            console.log("Make sure you have Metamask installed!");
            return;
        } else {
            console.log("Wallet exists! We're ready to go!")
        }

        const accounts = await ethereum.request({method: 'eth_accounts'});

        if (accounts.length !== 0) {
            account = accounts[0];
            console.log("Found an authorized account: ", account);
            setCurrentAccount(account);

            try {
                main = new web3.eth.Contract(abi, contractAddress);
                setPresaleWhitelist(await main.methods.presaleWhitelist(account).call());

                setTotalSupply(await main.methods.totalSupply().call());
                setTOTAL_SUPPLY(await main.methods.TOTAL_SUPPLY().call());

                setSaleActive(await main.methods.SALE_ACTIVE().call());
                let price = await main.methods.PUBLIC_SALE_PRICE().call();
                setWeiPrice(price);
                const _price = parseFloat(price / 1e18).toFixed(4);
                setCurrentPrice(_price);
                setDisplayPrice(_price);
                setMintAlert('You are NOT whitelisted. Minting from public sale.');
                setPresaleActive(await main.methods.PRESALE_ACTIVE().call());

                if (presaleWhitelist && presaleActive) {
                    price = await main.methods.PRESALE_PRICE().call();
                    const _price = parseFloat(price / 1e18).toFixed(4);
                    setWeiPrice(_price);
                    setCurrentPrice(_price);
                    setDisplayPrice(_price);
                    setMintAlert('You are whitelisted.');
                }
                console.log('PRESALE_ACTIVE', presaleActive);
                console.log('SALE_ACTIVE', saleActive);
                // loadLastMintedNft();

            } catch (err) {
                alert('ERROR: CHANGE YOUR NETWORK TO BSC TESTNET.');
                console.log(err.toString());
            }

        } else {
            console.log("No authorized account found");
        }
    }

    const mintNftHandler = async () => {
        let price = currentPrice;
        console.log('PRESALE_ACTIVE', presaleActive);
        console.log('SALE_ACTIVE', saleActive);
        if (!presaleActive && !saleActive) {
            setMintAlert('Mint is disabled.');
            return;
        }
        let tx;
        const totalPrice = weiPrice * mintAmount;
        const args = {from: account, value: totalPrice};
        console.log('mintAmount', mintAmount);
        if (presaleWhitelist && presaleActive) {
            await main.methods.mintPresale(mintAmount)
                .estimateGas(args, async function (err, res) {
                    if (err) {
                        alert(err.toString());
                    } else {
                        tx = await main.methods.mintPresale(mintAmount).send(args);
                        setMintAlert('Mint completed. Thank you, tx ', tx.transactionHash);
                        loadLastMintedNft();
                    }
                });

        } else {
            await main.methods.mintPublic(mintAmount)
                .estimateGas(args, async function (err, res) {
                    if (err) {
                        alert(err.toString());
                    } else {
                        tx = await main.methods.mintPublic(mintAmount).send(args);
                        setMintAlert('Mint completed. Thank you, tx ', tx.transactionHash);
                        loadLastMintedNft();
                    }
                });
        }

    }

    const loadLastMintedNft = async () => {
        let balanceOf = await main.methods.balanceOf(account).call();
        console.log('balanceOf', balanceOf);
        if (balanceOf == 0) return;
        --balanceOf;
        const tokenOfOwnerByIndex = await main.methods.tokenOfOwnerByIndex(account, balanceOf).call();
        let tokenURI = await main.methods.tokenURI(tokenOfOwnerByIndex).call();
        // tokenURI = 'http://localhost:3000/metadata/0?0';
        console.log('tokenURI', tokenURI);
        const res = await fetch(tokenURI, {crossDomain: true});
        const r = await res.json();
        setLastMint(r.image);
        // console.log(r);
    }

    const connectWalletHandler = async () => {
        ethereum = await getweb3();

        if (!ethereum) {
            alert("Please install Metamask!");
        }

        try {
            const accounts = await ethereum.provider.request({method: 'eth_requestAccounts'});
            console.log("Found an account! Address: ", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (err) {
            console.log(err)
        }
    }


    const connectWalletButton = () => {
        return (
            <>
                <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
                    Connect Wallet
                </button>
            </>
        )
    }

    const setAmount = (e) => {
        const amount = e.target.value;
        _setAmount(amount);
    }

    function _setAmount(amount) {
        setMintAmount(amount)
        const total = parseFloat(currentPrice * amount).toFixed(4)
        setDisplayPrice(total);
    }

    function setAmountLess() {
        let amount = mintAmount;
        if (amount > 1) amount--;
        document.getElementById('inputAmount').value = amount;
        _setAmount(amount)
    }

    function setAmountPlus() {
        let amount = mintAmount;
        amount++;
        document.getElementById('inputAmount').value = amount;
        _setAmount(amount)
    }

    const mintNftButton = () => {
        return (
            <>
                <div className="mint-status rounded shadow small p-1">
                    {mintAlert}
                </div>
                <Row className=" p-1">
                    <h3>BECOME A ZOGUER</h3>
                </Row>

                <Row className="border-top p-1">
                    <Col>AMOUNT</Col>
                    <Col>
                        <Row>
                            <input className='input-sig-button' defaultValue="-" type="button"
                                   onClick={setAmountLess}/>
                            <input id="inputAmount" className='input-button' defaultValue={1} type="number"
                                   onChange={setAmount}/>
                            <input className='input-sig-button' defaultValue="+" type="button"
                                   onClick={setAmountPlus}/>
                        </Row>
                    </Col>
                </Row>
                <Row className="border-top p-1">
                    <Col>Total</Col>
                    <Col>{displayPrice} ETH</Col>
                </Row>
                <Row className="border-top p-1">
                    <Col>Zoguer's Scouted</Col>
                    <Col>{totalSupply}/{TOTAL_SUPPLY}</Col>
                </Row>
                <Row className="p-3">
                    <button onClick={mintNftHandler} className='cta-button mint-nft-button rounded shadow p-1'>
                        Mint Now
                    </button>
                </Row>
                <Row>
                    <Col className="small p-1">{currentAccount}</Col>
                </Row>
            </>
        )
    }

    async function getweb3() {
        let web3Modal;
        let provider;
        let providerOptions;
        providerOptions = {
            metamask: {
                id: "injected",
                name: "MetaMask",
                type: "injected",
                check: "isMetaMask"
            },
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: "647c7c604e3a4164a3400530f46e8e34"
                }
            },
            authereum: {
                package: Authereum // required
            },
        };
        web3Modal = new Web3Modal({
            network: "",
            cacheProvider: true,
            providerOptions
        });
        provider = await web3Modal.connect();
        provider.on('error', e => console.error('WS Error', e));
        provider.on('end', e => console.error('WS End', e));

        provider.on("disconnect", (error) => {
            console.log(error);
        });
        provider.on("connect", (info) => {
            console.log(info);
        });
        web3 = new Web3(provider);

        return provider;
    }

    useEffect(() => {
        checkWalletIsConnected();
    }, [])

    return (
        <Row className='main-body'>
            <div>
                <h1>Zogue</h1>
            </div>
            <Row className="main-area">
                <Col></Col>
                <Col>
                    <div className='main-app rounded shadow-lg'>
                        <Row>
                            <Col>
                                {currentAccount ? mintNftButton() : connectWalletButton()}
                            </Col>
                            <Col className="d-none d-sm-block">
                                <img src={lastMint} height={280}
                                     className='rounded shadow-lg'/>
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col></Col>
            </Row>
        </Row>
    )
}

export default App;
