# Crypto API Server

Simple Express.js server that provides endpoints for interacting with blockchain APIs including Moralis and Alchemy.

## Features

- Get blockchain data
- Retrieve token balances
- Fetch token metadata for ERC20 tokens
- Get NFT metadata
- Transak integration for buying crypto

## Local Development

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with your API keys:
```
MORALIS_API="your_moralis_key"
ALCHEMY_API="your_alchemy_key"
TRANSAK_API="your_transak_key"
PORT=3000
```

3. Start the server:
```
npm start
```

The server will be available at http://localhost:3000

## Deploying to Render

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the following settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Add MORALIS_API, ALCHEMY_API, and TRANSAK_API with your API keys
   - Select the appropriate plan (Free tier works for testing)
   
4. Click "Create Web Service"

Render will automatically deploy your API server and provide a public URL for your endpoints.

## API Endpoints

- `/status` - Check server connection status
- `/getBlock` - Get blockchain data for a specific chain
- `/getTokenBalances` - Get token balances for a wallet address
- `/getTokenMetadata` - Get metadata for ERC20 tokens
- `/getNFTMetadata` - Get metadata for NFTs
- `/createTransakOrder` - Create order to buy crypto through Transak
- `/moveCursor` - (Demo) Move cursor on screen

## Notes

- Do not commit your `.env` file to version control
- The `.gitignore` file will prevent sensitive files from being pushed 