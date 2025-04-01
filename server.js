require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client'));

// Unified Service Configuration
const SERVICES = {
  moralis: {
    baseURL: 'https://deep-index.moralis.io/api/v2',
    endpoints: {
      address: (chain) => `/address`,
      nfts: (address, chain) => `/nft/${address}?chain=${chain}`,
      tokenBalances: (address, chain) => `/erc20/${address}/balance?chain=${chain}`,
      transactions: (address, chain) => `/transaction/${address}?chain=${chain}`,
      tokenMetadata: (addresses, chain) => `/erc20/metadata?chain=${chain}&addresses=${addresses}`,
      nftMetadata: (address, tokenId, chain) => `/nft/${address}/${tokenId}?chain=${chain}`
    },
    headers: { 'X-API-Key': process.env.MORALIS_API }
  },
  alchemy: {
    baseURL: (network) => `https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API}`,
    endpoints: {
      nfts: '/getNFTs',
      tokenBalances: '/getTokenBalances',
      transactionHistory: '/getTransactions'
    }
  }
};

// Cursor position for demo
let cursorPosition = { x: 0, y: 0 };
const CURSOR_SPEED = 10;

// 1. Block data endpoint
app.post('/getBlock', async (req, res) => {
  try {
    const { chainId } = req.body;
    const chain = `0x${Number(chainId).toString(16)}`;
    
    try {
      // Try Moralis first
      const url = `${SERVICES.moralis.baseURL}/block/${chainId}?chain=${chain}`;
      const response = await axios.get(url, {
        headers: SERVICES.moralis.headers
      });
      res.json({ data: response.data, source: 'moralis' });
    } catch (error) {
      // Fallback to Alchemy
      const network = chainId === '1' ? 'eth-mainnet' : `eth-${chainId}`;
      const url = `${SERVICES.alchemy.baseURL(network)}/v2/getBlock`;
      const response = await axios.post(url, {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBlockByNumber",
        params: ["latest", true]
      });
      res.json({ data: response.data, source: 'alchemy' });
    }
  } catch (error) {
    console.error('Error getting block data:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Token Balances endpoint
app.post('/getTokenBalances', async (req, res) => {
  try {
    const { address, chainId = '1' } = req.body;
    const chain = chainId === '1' ? 'eth' : `0x${Number(chainId).toString(16)}`;
    
    const url = `${SERVICES.moralis.baseURL}${SERVICES.moralis.endpoints.tokenBalances(address, chain)}`;
    const response = await axios.get(url, {
      headers: SERVICES.moralis.headers
    });
    
    res.json({ 
      data: response.data,
      source: 'moralis'
    });
  } catch (error) {
    console.error('Error getting token balances:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for token metadata
app.post('/getTokenMetadata', async (req, res) => {
  try {
    const { addresses, chainId = '1' } = req.body;
    const chain = chainId === '1' ? 'eth' : `0x${Number(chainId).toString(16)}`;
    
    const url = `${SERVICES.moralis.baseURL}${SERVICES.moralis.endpoints.tokenMetadata(addresses, chain)}`;
    console.log('Requesting token metadata from:', url);
    
    const response = await axios.get(url, {
      headers: SERVICES.moralis.headers
    });
    
    res.json({ 
      data: response.data,
      source: 'moralis'
    });
  } catch (error) {
    console.error('Error getting token metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for NFT metadata
app.post('/getNFTMetadata', async (req, res) => {
  try {
    const { address, tokenId, chainId = '1' } = req.body;
    const chain = chainId === '1' ? 'eth' : `0x${Number(chainId).toString(16)}`;
    
    const url = `${SERVICES.moralis.baseURL}${SERVICES.moralis.endpoints.nftMetadata(address, tokenId, chain)}`;
    console.log('Requesting NFT metadata from:', url);
    
    const response = await axios.get(url, {
      headers: SERVICES.moralis.headers
    });
    
    res.json({ 
      data: response.data,
      source: 'moralis'
    });
  } catch (error) {
    console.error('Error getting NFT metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Transak integration
app.post('/createTransakOrder', async (req, res) => {
  try {
  const response = await axios.post(
      'https://api.transak.com/api/v2/order',
      req.body,
      { headers: { 'apiKey': process.env.TRANSAK_API } }
    );
    res.json({ 
      status: response.data.status, 
      url: response.data.transactionLink 
    });
  } catch (error) {
    console.error('Error creating Transak order:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Cursor movement demo
app.post('/moveCursor', (req, res) => {
  try {
    const { direction, steps = 1 } = req.body;
  
  const moveX = direction.includes('right') ? 1 : direction.includes('left') ? -1 : 0;
    const moveY = direction.includes('down') ? 1 : direction.includes('up') ? -1 : 0;
    
    cursorPosition.x += moveX * steps * CURSOR_SPEED;
    cursorPosition.y += moveY * steps * CURSOR_SPEED;
    
    res.json({ position: cursorPosition });
  } catch (error) {
    console.error('Error moving cursor:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Check connection/status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'connected',
    apis: {
      moralis: !!process.env.MORALIS_API,
      alchemy: !!process.env.ALCHEMY_API,
      transak: !!process.env.TRANSAK_API
    },
    server: {
      time: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});