const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017/?directConnection=true';

async function initReplicaSet() {
  const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected successfully');
    
    const admin = client.db('admin').admin();
    
    console.log('Initializing replica set...');
    const result = await admin.command({
      replSetInitiate: {
        _id: "rs0",
        members: [{ _id: 0, host: "localhost:27017" }]
      }
    });
    
    console.log('✓ Replica set initialized successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    console.log('\nWaiting a few seconds for replica set to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const status = await admin.command({ replSetGetStatus: 1 });
    console.log('\n✓ Replica set status:', status.set);
    console.log('✓ State:', status.members[0].stateStr);
    
  } catch (err) {
    if (err.codeName === 'AlreadyInitialized') {
      console.log('✓ Replica set is already initialized');
    } else {
      console.error('✗ Error:', err.message);
    }
  } finally {
    await client.close();
  }
}

initReplicaSet();
