const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits } = require("ethers"); // v6

describe("RealEstateToken", function () {
  let owner, buyer, other, RET, tok;

  beforeEach(async function () {
    [owner, buyer, other] = await ethers.getSigners();
    RET = await ethers.getContractFactory("RealEstateToken");
    tok = await RET.deploy(
      "Real Estate Token",
      "RET",
      100000,
      1,
      parseUnits("0.001", "ether")
    );
  });

  it("deploys with correct initial supply", async function () {
    const ownerBalance = await tok.balanceOf(owner.address);
    expect(ownerBalance).to.equal(await tok.totalSupply());
  });

  it("allows buyer to purchase tokens", async function () {
    await tok.connect(owner).setTokenPrice(parseUnits("0.0001", "ether"));

    await tok
      .connect(buyer)
      .buyTokens({ value: parseUnits("0.0002", "ether") });

    const buyerBalance = await tok.balanceOf(buyer.address);
    expect(buyerBalance).to.be.gt(0);
  });

  it("prevents non-owners from changing price", async function () {
    await expect(
      tok.connect(buyer).setTokenPrice(parseUnits("0.01", "ether"))
    ).to.be.revertedWithCustomError(tok, "OwnableUnauthorizedAccount");
  });

  it("allows transfer of tokens", async function () {
    await tok.connect(owner).transfer(buyer.address, 1000);
    expect(await tok.balanceOf(buyer.address)).to.equal(1000);
  });

  it("allows burning of tokens", async function () {
    const initialSupply = await tok.totalSupply();
    await tok.connect(owner).burn(500);
    const finalSupply = await tok.totalSupply();
    expect(finalSupply).to.equal(initialSupply - 500n); // bigint
  });

  it("allows owner to withdraw ETH", async function () {
    // buyer kupuje tokeny -> ETH trafia do kontraktu
    await tok.connect(buyer).buyTokens({ value: parseUnits("0.01", "ether") });

    const contractBalanceBefore = await ethers.provider.getBalance(tok.target);
    expect(contractBalanceBefore).to.be.gt(0);

    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    const tx = await tok.connect(owner).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    expect(ownerBalanceAfter + gasUsed).to.be.gt(ownerBalanceBefore);
  });
});
