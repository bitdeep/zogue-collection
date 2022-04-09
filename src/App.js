import {useEffect, useState} from 'react';
import './App.css';
import contract from './contracts/NFTCollectible.json';
import {ethers} from 'ethers';
import logo from './logo.png'

import Web3 from "web3";
import Web3Modal from "web3modal";
import Authereum from "authereum";
import WalletConnectProvider from "@walletconnect/web3-provider";

const contractAddress = "0x355638a4eCcb777794257f22f50c289d4189F245";
const abi = contract.abi;
let web3, ethereum;

function App() {

    const [currentAccount, setCurrentAccount] = useState(null);

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
            const account = accounts[0];
            console.log("Found an authorized account: ", account);
            setCurrentAccount(account);
        } else {
            console.log("No authorized account found");
        }
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

    const mintNftHandler = async () => {
        try {

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const nftContract = new ethers.Contract(contractAddress, abi, signer);

                console.log("Initialize payment");
                let nftTxn = await nftContract.mintNFTs(1, {value: ethers.utils.parseEther("0.01")});

                console.log("Mining... please wait");
                await nftTxn.wait();

                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

            } else {
                console.log("Ethereum object does not exist");
            }

        } catch (err) {
            console.log(err);
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

    const mintNftButton = () => {
        return (
            <>
                <input className='input-button' defaultValue={1} type="number"/>
                <br/><br/>
                <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
                    Mint NFT
                </button>
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
                package: WalletConnectProvider, // required
                options: {
                    infuraId: "INFURA_ID", // Required
                    network: "rinkeby",
                    qrcodeModalOptions: {
                        mobileLinks: [
                            "rainbow",
                            "metamask",
                            "argent",
                            "trust",
                            "imtoken",
                            "pillar"
                        ]
                    }
                }
            },
            authereum: {
                package: Authereum // required
            },
        };
        web3Modal = new Web3Modal({
            network: "rinkeby",
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
        <div className='main-app'>
            <img src={logo} height={220}/>
            <h1>Zogue</h1>
            <div>
                {currentAccount ? mintNftButton() : connectWalletButton()}
            </div>
        </div>
    )
}

export default App;
