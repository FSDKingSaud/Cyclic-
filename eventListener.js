import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Read the JSON files
const TokenICO = JSON.parse(readFileSync('./abis/TokenICO.json', 'utf-8'));
const TokenERC20 = JSON.parse(readFileSync('./abis/TokenERC20.json', 'utf-8'));

// Set up provider and contracts
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, TokenICO.abi, provider);

const contractERC20Address = '0x2C93585092Cf52Ce8B0947cB7A2680d17F2887D0';
const contractERC20 = new ethers.Contract(contractERC20Address, TokenERC20.abi, provider);

// MongoDB connection
const mongoClient = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db(dbName);
    return db.collection(collectionName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the script if MongoDB connection fails
  }
}

// Save event data to MongoDB
async function saveEventToMongoDB(eventData) {
  const collection = await connectToMongoDB();
  try {
    const result = await collection.insertOne(eventData);
    console.log('Event data saved to MongoDB:', result.insertedId);
  } catch (error) {
    console.error('Error saving event data to MongoDB:', error);
  }
}

// Listen to Purchase events
contract.on('Purchase', async (user, tokenAmount) => {
  const eventData = {
    event: 'Purchase',
    user,
    tokenAmount: ethers.utils.formatUnits(tokenAmount, 18),
    timestamp: new Date(),
  };

  console.log('Purchase Event:', eventData);
  await saveEventToMongoDB(eventData);
});

// Listen to Referral events
contract.on('Referral', async (referrer, user, referralBonus) => {
  const eventData = {
    event: 'Referral',
    referrer,
    user,
    referralBonus: ethers.utils.formatUnits(referralBonus, 18),
    timestamp: new Date(),
  };

  console.log('Referral Event:', eventData);
  await saveEventToMongoDB(eventData);
});

// Listen to Transfer events (ERC20)
contractERC20.on('Transfer', async (from, to, amount) => {
  const eventData = {
    event: 'Transfer',
    from,
    to,
    amount: ethers.utils.formatUnits(amount, 18),
    timestamp: new Date(),
  };

  console.log('Transfer Event:', eventData);
  await saveEventToMongoDB(eventData);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await mongoClient.close();
  process.exit();
});