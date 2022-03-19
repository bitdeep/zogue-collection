const hre = require("hardhat");
require("@nomiclabs/hardhat-etherscan");
// npx hardhat run scripts\testnet.js --network testnet
async function main() {
    // this is the same root generated in the test file
    // for live contract generate a new, see test-case:
    const _Main = await hre.ethers.getContractFactory("Main");
    const Main = await _Main.deploy();
    await Main.deployed();
    console.log("Main:", Main.address);

    await hre.run("verify:verify", {
        address: Main.address,
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
