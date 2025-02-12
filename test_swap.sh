#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: sh call.sh <PRIVATE_KEY>"
    exit 1
fi

PRIVATE_KEY=$1

# Deposit 0.1 ETH to WETH contract
cast send 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 "deposit()" --value 100000000000000000 --rpc-url http://13.125.106.88:8545 --private-key $PRIVATE_KEY

# Approve SwapRouter to spend 0.05 WETH
cast send 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 "approve(address,uint256)" 0xE592427A0AEce92De3Edee1F18E0157C05861564 50000000000000000 --rpc-url http://13.125.106.88:8545 --private-key $PRIVATE_KEY

# Swap 0.05 WETH to USDC using Uniswap V3 SwapRouter
cast send 0xE592427A0AEce92De3Edee1F18E0157C05861564 "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))" "(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,3000,0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,999999999999999999999,50000000000000000,0,0)" --rpc-url http://13.125.106.88:8545 --private-key $PRIVATE_KEY
