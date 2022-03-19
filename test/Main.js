const {expect} = require("chai");
const {ethers} = require("hardhat");

let main, DEV, USER, dev, user;
describe("Main", function () {
    beforeEach(async function () {
        this.timeout(140000);
        const accounts = await ethers.getSigners();
        DEV = accounts[0];
        USER = accounts[1];
        dev = DEV.address;
        user = USER.address;

        const Main = await ethers.getContractFactory('Main');
        main = await Main.deploy();
        await main.deployed();
    });

    describe("Balance", function () {
        it("check if we receive ETH on mint", async function () {
            await main.setSaleStatus(true);
            const payment = ethers.utils.parseUnits('0.14', '18').toString();
            const feeRecipient = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92261';
            await main.setFeeRecipient(feeRecipient)
            await main.mintPublic('1', {value: payment})
            expect(await main.provider.getBalance(feeRecipient)).to.be.eq(payment);
        });
    });

    describe("Token URI", function () {
        it("mint and check token uri if correct", async function () {
            await main.setSaleStatus(true);
            const payment = ethers.utils.parseUnits('0.14', '18').toString();
            await main.mintPublic('1', {value: payment})
            await main.setBaseURI('http://localhost/')
            const uriOf1 = await main.tokenURI('0')
            expect(uriOf1).to.be.eq('http://localhost/0');
        });
    });
    describe("PublicSale Security", function () {
        it("prevent mint if presale not active yet", async function () {
            await main.setSaleStatus(false);
            const payment = ethers.utils.parseUnits('0.14', '18').toString();
            await expect(
                main.mintPublic('1', {value: payment})
            ).to.be.revertedWith('Pre-sale must be active to mint')
        });
        it("prevent mint if price is too low", async function () {
            await main.setSaleStatus(true);
            const payment = ethers.utils.parseUnits('0.1', '18').toString();
            await expect(
                main.mintPublic('1', {value: payment})
            ).to.be.revertedWith('Ether value sent is not correct')
        });
        it("prevent mint if price if above supply limit", async function () {
            await main.setSaleStatus(true);
            const payment = ethers.utils.parseUnits('0.60', '18').toString();
            await expect(
                main.mintPublic('2551', {value: payment})
            ).to.be.revertedWith('Purchase would exceed max supply of tokens')
        });
        it("allow mint if ETH sent is correct", async function () {
            await main.setSaleStatus(true);
            const payment = ethers.utils.parseUnits('0.14', '18').toString();
            await main.mintPublic('1', {value: payment});
        });

    });

    describe("PreSale Security", function () {
        it("prevent mint if not whitelisted", async function () {
            await main.setPresaleStatus(true);
            const payment = ethers.utils.parseUnits('0.14', '18').toString();
            await expect(
                main.mintPresale('1', {value: payment})
            ).to.be.revertedWith('No whitelisted')
        });


        it("prevent mint if presale not active yet", async function () {
            await main.setPresaleStatus(false);
            const payment = ethers.utils.parseUnits('0.14', '18').toString();
            await main.setWhitelist(dev, true);
            await expect(
                main.mintPresale('1', {value: payment})
            ).to.be.revertedWith('Pre-sale must be active to mint')
        });

        it("prevent mint if price is too low", async function () {
            await main.setPresaleStatus(true);
            await main.setWhitelist(dev, true);
            let payment = ethers.utils.parseUnits('0.1', '18').toString();
            await expect(
                main.mintPresale('1', {value: payment})
            ).to.be.revertedWith('Ether value sent is not correct')
            await expect(
                main.mintPresale('1')
            ).to.be.revertedWith('Ether value sent is not correct')
        });

        it("prevent mint above mint limit", async function () {
            await main.setPresaleStatus(true);
            await main.setWhitelist(dev, true);
            let payment = ethers.utils.parseUnits('0.28', '18').toString();
            await expect(
                main.mintPresale('3', {value: payment})
            ).to.be.revertedWith('Can only mint 2 tokens at a time')
            await main.mintPresale('2', {value: payment});
        });


        it("allow mint up to the limit", async function () {
            await main.setPresaleStatus(true);
            await main.setWhitelist(dev, true);
            let payment = ethers.utils.parseUnits('0.14', '18').toString();
            await main.mintPresale('1', {value: payment});
            await main.mintPresale('1', {value: payment});
            await expect(
                main.mintPresale('1', {value: payment})
            ).to.be.revertedWith('Can only mint 2 tokens at a time')
        });

        it("prevent minting above presale limit", async function () {
            await main.setWhitelist(dev, true);
            await main.setPresaleStatus(true);
            let payment = ethers.utils.parseUnits('6.5', '18').toString();
            await expect(
                main.mintPresale('2551', {value: payment})
            ).to.be.revertedWith('Purchase would exceed max supply of tokens');
        });

    });

});
