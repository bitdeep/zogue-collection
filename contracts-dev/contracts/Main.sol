// https://Zoogue.Meta




//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
contract Main is ERC721Enumerable, Ownable {
    string private _baseURIPrefix;
    uint256 public TOTAL_LIMIT = 2550;
    uint256 public PUBLIC_LIMIT = 550;
    uint256 public PRESALE_LIMIT = 2000;
    uint256 public PRESALE_PRICE = 0.1 ether;
    uint256 public PUBLIC_SALE_PRICE = 0.14 ether;
    uint256 public MAX_MINT_PER_PRESALE = 2;
    uint256 public MAX_MINT_PER_PUBLICSALE = 4;
    address public FEE_RECIPIENT;
    bool public PRESALE_ACTIVE = false;
    bool public SALE_ACTIVE = false;

    uint256 public publicMinted = 0;
    uint256 public presaleMinted = 0;
    mapping(address=>bool) public presaleWhitelist;
    mapping(address=>uint) public presaleMint;
    mapping(address=>uint) public publicMint;
    constructor() ERC721("ZOGUE", "ZOGUE") {
        FEE_RECIPIENT = msg.sender;
    }
    function setTotalLimit(uint256 val) public onlyOwner {
        TOTAL_LIMIT = val;
    }
    function setPublicPrice(uint256 val) public onlyOwner {
        PUBLIC_SALE_PRICE = val;
    }
    function setPresalePrice(uint256 val) public onlyOwner {
        PRESALE_PRICE = val;
    }
    function setMaxMintPerPresale(uint256 val) public onlyOwner {
        MAX_MINT_PER_PRESALE = val;
    }
    function setMaxMintPerPublicSale(uint256 val) public onlyOwner {
        PUBLIC_SALE_PRICE = val;
    }
    function setPresaleLimit(uint256 val) public onlyOwner {
        PRESALE_LIMIT = val;
    }
    function setPublicSaleLimit(uint256 val) public onlyOwner {
        PUBLIC_LIMIT = val;
    }
    function setFeeRecipient(address to) public onlyOwner {
        FEE_RECIPIENT = to;
    }
    function setPresaleStatus(bool status) public onlyOwner {
        PRESALE_ACTIVE = status;
    }
    function setSaleStatus(bool status) public onlyOwner {
        SALE_ACTIVE = status;
    }
    function setWhitelist(address user, bool status) public onlyOwner {
        presaleWhitelist[user] = status;
    }
    function setWhiteLists(address[] calldata _addrs) external onlyOwner {
        for(uint256 i = 0 ; i < _addrs.length ; i ++) {
            presaleWhitelist[_addrs[i]] = true;
        }
    }



    function mintPresale(uint numberOfTokens) public payable {
        require(PRESALE_ACTIVE, "Pre-sale must be active to mint");
        if( presaleWhitelist[msg.sender] && presaleMint[msg.sender] < 2 ){
            // whitelisted & mint < 2
            require(presaleMinted+numberOfTokens <= PRESALE_LIMIT, "Purchase would exceed max supply of tokens");
            require(presaleMint[msg.sender]+numberOfTokens <= MAX_MINT_PER_PRESALE, "Can only mint 2 tokens at a time");
            require(PRESALE_PRICE*numberOfTokens == msg.value, "Ether value sent is not correct");
            for(uint i = 0; i < numberOfTokens; i++) {
                _safeMint(msg.sender, totalSupply());
                presaleMinted++;
                presaleMint[msg.sender]++;
            }
        }else if( presaleWhitelist[msg.sender] && presaleMint[msg.sender] >= 2 ){
            // whitelisted mint > 2
            require(publicMinted+numberOfTokens <= PUBLIC_LIMIT, "Purchase would exceed max supply of tokens");
            require(presaleMint[msg.sender]+numberOfTokens <= MAX_MINT_PER_PRESALE+MAX_MINT_PER_PUBLICSALE, "Can only mint 4 tokens at a time");
            require(PUBLIC_SALE_PRICE*numberOfTokens == msg.value, "Ether value sent is not correct");
            for(uint i = 0; i < numberOfTokens; i++) {
                _safeMint(msg.sender, totalSupply());
                publicMinted++;
                presaleMint[msg.sender]++;
            }
        }else{
            // non wl members
            require(publicMinted+numberOfTokens <= PUBLIC_LIMIT, "Purchase would exceed max public tokens");
            require(publicMint[msg.sender]+numberOfTokens <= MAX_MINT_PER_PUBLICSALE, "Can only mint 4 tokens at a time");
            require(PUBLIC_SALE_PRICE*numberOfTokens == msg.value, "Ether value sent is not correct");
            for(uint i = 0; i < numberOfTokens; i++) {
                _safeMint(msg.sender, totalSupply());
                publicMinted++;
                publicMint[msg.sender]++;
            }
        }
        internalSendFeeTo();
    }
    function mintPublic(uint numberOfTokens) public payable {
        require(SALE_ACTIVE, "Pre-sale must be active to mint");
        require(totalSupply()+numberOfTokens <= TOTAL_LIMIT, "Purchase would exceed max public tokens");
        require(publicMint[msg.sender]+numberOfTokens <= MAX_MINT_PER_PUBLICSALE, "Can only mint 4 tokens at a time");
        require(PUBLIC_SALE_PRICE*numberOfTokens == msg.value, "Ether value sent is not correct");
        for(uint i = 0; i < numberOfTokens; i++) {
            _safeMint(msg.sender, totalSupply());
            publicMinted++;
            publicMint[msg.sender]++;
        }
        internalSendFeeTo();
    }
    function adminMint(uint numberOfTokens) public onlyOwner {
        for(uint i = 0; i < numberOfTokens; i++) {
            _safeMint(msg.sender, totalSupply());
        }
    }
    function internalSendFeeTo() internal{
        (bool transferStatus,) = FEE_RECIPIENT.call{value : msg.value}("");
        require(transferStatus, "Failed to send to FEE_RECIPIENT");
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIPrefix;
    }
    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseURIPrefix = baseURI;
    }
}
