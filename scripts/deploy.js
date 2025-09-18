async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const initialSupply = 100_000; // 100k tokens
  const propertyId = 1;
  const tokenPriceWei = ethers.utils.parseUnits("0.001", "ether"); // 0.001 ETH per token

  const instance = await RealEstateToken.deploy(
    "Real Estate Token",
    "RET",
    initialSupply,
    propertyId,
    tokenPriceWei
  );
  await instance.deployed();
  console.log("Deployed to:", instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
