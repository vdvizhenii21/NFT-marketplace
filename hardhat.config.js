require("@nomiclabs/hardhat-waffle");


const ALCHEMY_API_KEY = "0PiPPBFmzGVfyoTCFHGnft5m-8Dk60RE";

const RINKEBY_PRIVATE_KEY = "fddb20c0da1164e6000537b92596f2483a2a91c657fab1c88d1da1ca1c67465a";
const projectId = '4dc5c4b05b664f0ab7610f1adb039c7c'
const fs = require('fs')
const keyData = fs.readFileSync('./p-key.txt', {
  encoding: 'utf8', flag: 'r'
});

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts: [keyData]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${projectId}`,
      accounts: [keyData]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`]
    }
  }
};
