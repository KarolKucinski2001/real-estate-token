// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC20, Ownable {
    uint256 public propertyId;
    uint256 public tokenPriceWei;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 value);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 propertyId_,
        uint256 tokenPriceWei_
    ) ERC20(name_, symbol_) Ownable() {
        propertyId = propertyId_;
        tokenPriceWei = tokenPriceWei_;
        _mint(msg.sender, initialSupply_ * (10 ** decimals()));
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function buyTokens() external payable {
        require(tokenPriceWei > 0, "Token price not set");
        uint256 tokensToBuy = msg.value / tokenPriceWei;
        require(tokensToBuy > 0, "Send more ETH");
        _transfer(owner(), msg.sender, tokensToBuy * (10 ** decimals()));
        emit TokensPurchased(msg.sender, tokensToBuy, msg.value);
    }

    function setTokenPrice(uint256 newPriceWei) external onlyOwner {
        tokenPriceWei = newPriceWei;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
