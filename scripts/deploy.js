
const hre = require("hardhat");
const fs = require('fs')

async function main() {

  const NFTMarket = await hre.ethers.getContractFactory("KBMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket contract deployed to: ", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("NFT contract deployed to: ", nftMarket.address);

  const Token = await hre.ethers.getContractFactory("OurToken");
  const token = await Token.deploy();
  await token.deployed();
  console.log("token contract deployed to: ", token.address);


  let config = `
  export const nftmarketaddress = ${nftMarket.address}
  export const nftaddress = ${nft.address}
  export const tokenaddress = ${token.address}`

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
