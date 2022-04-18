require("@nomiclabs/hardhat-waffle");
require('dotenv').config({path: '.env'});
require("hardhat-deploy");
require("hardhat-deploy-ethers");

module.exports = {
    solidity: {
        compilers: [
            {
                version: '0.8.4',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            blockGasLimit: 12_450_000,
            hardfork: "london"
        },
        localhost: {
            url: 'http://localhost:8545',
        },
        mainnet: {
            url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS}/eth/mainnet`,
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        testnet: {
            url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS}/eth/ropsten`,
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
    },
    paths: {
        sources: 'contracts',
    },
    mocha: {
        timeout: 0,
    },
    etherscan: {
        apiKey: `${process.env.API_KEY}`
    }
};
