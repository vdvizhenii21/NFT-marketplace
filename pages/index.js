import { ethers, providers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftaddress, nftmarketaddress, tokenaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'
import OurToken from '../artifacts/contracts/OurToken.sol/OurToken.json'



export default function Home() {
  const [nfts, setNFts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    // what we want to load:
    // ***provider, tokenContract, marketContract, data for our marketItems***

    const provider = new providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, KBMarket.abi, provider)
    const data = await marketContract.fetchAvailableMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // we want get the token metadata - json 
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))

    setNFts(items)
    setLoadingState('loaded')
  }

  // function to buy nfts for market 

  async function buyNFT(nft) {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      const provider = new ethers.providers.Web3Provider(connection, 'any')
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner()
      console.log(signer)
      const token = new ethers.Contract(tokenaddress, OurToken.abi, signer)
      const transaction1 = await token.approve(nftmarketaddress, price)
      await transaction1.wait()
      const market = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
      const transaction2 = await market.createMarketSale(nftaddress, tokenaddress, nft.tokenId)
      await transaction2.wait()
      loadNFTs()
    } catch (err) { console.log(err) }

  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1
    className='px-20 py-7 text-4x1'>No NFts in marketplace</h1>)

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '160px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            nfts.map((nft, i) => (
              <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                <img src={nft.image} />
                <div className='p-4'>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>{
                    nft.name}</p>
                  <div style={{ height: '72px', overflow: 'hidden' }}>
                    <p className='text-gray-400'>{nft.description}</p>
                  </div>
                </div>
                <div className='p-4 bg-black'>
                  <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} LIV</p>
                  <button className='w-full bg-purple-500 text-white font-bold py-3 px-12 rounded'
                    onClick={() => buyNFT(nft)} >Buy
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
