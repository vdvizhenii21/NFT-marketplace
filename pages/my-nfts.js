
// we want to load the users nfts and display

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftaddress, nftmarketaddress, stakeddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'
import NFTStaking from '../artifacts/contracts/NFTStaking.sol/NFTStaking.json'

export default function MyAssets() {
    // array of nfts
    const [nfts, setNFts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
    }, [])

    async function loadNFTs() {
        // what we want to load:
        // we want to get the msg.sender hook up to the signer to display the owner nfts

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        console.log(signer)

        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
        const data = await marketContract.fetchOwnedMarketItems()

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

    async function stakeit() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const nfstaking = new ethers.Contract(stakeddress, NFTStaking.abi, signer)
        const nft = new ethers.Contract(nftaddress, NFT.abi, signer)
        const signerAddress = await signer.getAddress()
        console.log(signerAddress)
        const tx1 = await nft.setApprovalForAll(stakeddress, true)
        await tx1.wait()
        //const accounts = await web3.eth.getAccounts();
        //const account = accounts[0];
        //const tokenids = Number(document.querySelector("[name=stkid]").value);
        const tx0 = await nft.approve(stakeddress, 1);
        await tx0.wait()
        const tx = await nfstaking.stake([1]);
        await tx.wait()

    }

    async function claim() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const nfstaking = new ethers.Contract(stakeddress, NFTStaking.abi, signer)
        const nft = new ethers.Contract(nftaddress, NFT.abi, signer)
        const tx = await nfstaking.claim([1]);
        await tx.wait()
    }
    async function unstakeit() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const nfstaking = new ethers.Contract(stakeddress, NFTStaking.abi, signer)

        var tokenids = Number(document.querySelector("[name=stkid]").value);
        nfstaking.unstake([tokenids]).send({ from: signer });
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1
        className='px-20 py-7 text-4x1'>You do not own any NFTs currently :(</h1>)

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
                                    <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} Token</p>
                                </div>
                                <div className='p-4 bg-black'>
                                    <p className='text-3x-1 mb-4 font-bold text-white'>NFT ID: {nft.tokenId}</p>
                                </div>
                                <button className='w-full bg-purple-500 text-white font-bold py-3 px-12 rounded'
                                    onClick={() => stakeit()} >stake
                                </button>
                                <div className='p-4 bg-black'>
                                    <button className='w-full bg-purple-500 text-white font-bold py-3 px-12 rounded'
                                        onClick={() => claim()} >claim
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
