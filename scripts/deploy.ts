import { ethers, network } from 'hardhat'
import { ContractFactory } from 'ethers'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }

const artifacts: { [name: string]: ContractJson } = {
  SwapRouter: require('../artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
  NonfungiblePositionManager: require('../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
  NonfungibleTokenPositionDescriptor: require('../artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('Deploying contracts with account:', owner.address)

  /* Fetch addresses from the network */
  let weth9_address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // in mainnet
  let uniswapV3Factory_address = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c' // fetch from the v3-core

  // SwapRouter
  let swapRouter_address = ''
  let swapRouter
  if (!swapRouter_address) {
    const SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner)
    swapRouter = await SwapRouter.deploy(
        uniswapV3Factory_address, 
        weth9_address
    )
    await swapRouter.deployed()

    swapRouter_address = swapRouter.address
    console.log('SwapRouter deployed to:', swapRouter_address)
  } else {
    swapRouter = new ethers.Contract(swapRouter_address, artifacts.SwapRouter.abi, owner)
  }

  // NFTDescriptor library
  const NFTDescriptorLib = await ethers.getContractFactory('NFTDescriptor')
  const nftDescriptorLib = await NFTDescriptorLib.deploy()
  await nftDescriptorLib.deployed()
  console.log('NFTDescriptor Library deployed to:', nftDescriptorLib.address)

  // NonfungibleTokenPositionDescriptor
  let nonfungibleTokenPositionDescriptor_address = ''
  let nonfungibleTokenPositionDescriptor
  if (!nonfungibleTokenPositionDescriptor_address) {

    const NonfungibleTokenPositionDescriptor = await ethers.getContractFactory(
      'NonfungibleTokenPositionDescriptor',
      {
        libraries: {
          NFTDescriptor: nftDescriptorLib.address
        },
      }
    )
    nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
      weth9_address
    )
    await nonfungibleTokenPositionDescriptor.deployed()

    nonfungibleTokenPositionDescriptor_address = nonfungibleTokenPositionDescriptor.address
    console.log('NonfungibleTokenPositionDescriptor deployed to:', nonfungibleTokenPositionDescriptor_address)
  } else {
    nonfungibleTokenPositionDescriptor = new ethers.Contract(
      nonfungibleTokenPositionDescriptor_address,
      artifacts.NonfungibleTokenPositionDescriptor.abi,
      owner
    )
  }

  // NonfungiblePositionManager
  let nonfungiblePositionManager_address = ''
  let nonfungiblePositionManager
  if (!nonfungiblePositionManager_address) {
    const NonfungiblePositionManager = new ContractFactory(
      artifacts.NonfungiblePositionManager.abi,
      artifacts.NonfungiblePositionManager.bytecode,
      owner
    )
    nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
      uniswapV3Factory_address,
      weth9_address,
      nonfungibleTokenPositionDescriptor_address
    )
    await nonfungiblePositionManager.deployed()

    nonfungiblePositionManager_address = nonfungiblePositionManager.address
    console.log('NonfungiblePositionManager deployed to:', nonfungiblePositionManager_address)
  } else {
    nonfungiblePositionManager = new ethers.Contract(
      nonfungiblePositionManager_address,
      artifacts.NonfungiblePositionManager.abi,
      owner
    )
  }

  // Save deployed CAs
  const contracts = {
    // ... existing code ...
    SwapRouter: swapRouter_address,
    NonfungibleTokenPositionDescriptor: nonfungibleTokenPositionDescriptor_address,
    NonfungiblePositionManager: nonfungiblePositionManager_address,
    NFTDescriptor: nftDescriptorLib.address,
    WETH9: weth9_address,
    UniswapV3Factory: uniswapV3Factory_address,
  }

  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments')
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
  console.log(`Deployment addresses written to ./deployments/${networkName}.json`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
