const hre = require("hardhat");
require("@nomiclabs/hardhat-etherscan");
// npx hardhat run scripts\testnet.js --network testnet
async function main() {
/*
    const [_dev] = await hre.ethers.getSigners();
    const dev = _dev.address;
    console.log('dev', dev);
    const _Main = await hre.ethers.getContractFactory("Main");
    const Main = await _Main.deploy();
    await Main.deployed();
    console.log("Main:", Main.address);

    await Main.setPresaleStatus(true);
    await Main.setSaleStatus(true);
    await Main.setWhitelist(dev, true);
    await Main.setBaseURI('https://zogue-collection.pages.dev/metadata/');
*/
    await hre.run("verify:verify", {
        address: '0x6AeCf42F748eaF4335ae9362591619B6D9F68870',
        constructorArguments: [],
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
