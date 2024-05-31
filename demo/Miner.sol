// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GOLD.sol";

contract Miner is ERC721Enumerable, Ownable {
    uint256 public constant MAX_SUPPLY = 100;
    GOLD private goldToken;

    mapping(uint256 => uint256) private lastClaimedBlock;

    constructor(address goldTokenAddress) ERC721("Miner", "MINER") Ownable(msg.sender) {
        goldToken = GOLD(goldTokenAddress);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://api.example.com/meta/";
    }

    // Mint function to mint Miner NFTs
    function mintMiner(address to, uint256 tokenId) external onlyOwner {
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        _safeMint(to, tokenId);
        lastClaimedBlock[tokenId] = block.number;
    }

    // Overriding transfer functions to handle GOLD emission
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        if (from != address(0)) { // This is not a minting operation
            _claimGold(from, tokenId);
        }

        if (to != address(0)) {
            lastClaimedBlock[tokenId] = block.number;
        }
    }

    // Claim GOLD tokens based on the duration of holding MINER
    function claimGold(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "You do not own this token");
        _claimGold(msg.sender, tokenId);
    }

    function _claimGold(address owner, uint256 tokenId) private {
        uint256 lastClaimed = lastClaimedBlock[tokenId];
        require(lastClaimed != 0, "Token is not claimed yet.");

        uint256 heldBlocks = block.number - lastClaimed;
        if (heldBlocks > 0) {
            goldToken.mint(owner, heldBlocks);
            lastClaimedBlock[tokenId] = block.number;
        }
    }
}