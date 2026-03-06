const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017/workflow';

async function testConnection() {
  const client = new MongoClient(url);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connected successfully to MongoDB');
    
    const db = client.db('workflow');
    const admin = db.admin();
    
    // Check replica set status
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log('✓ MongoDB is running as a replica set:', status.set);
    } catch (err) {
      if (err.codeName === 'NoReplicationEnabled') {
        console.log('✗ MongoDB is NOT configured as a replica set');
        console.log('\nTo fix this, you need to:');
        console.log('1. Stop MongoDB service (as admin): net stop MongoDB');
        console.log('2. Add to mongod.cfg: replication:\\n  replSetName: "rs0"');
        console.log('3. Start MongoDB service (as admin): net start MongoDB');
        console.log('4. Initialize replica set: rs.initiate()');
      } else {
        console.log('Error checking replica set:', err.message);
      }
    }
    
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB');
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

testConnection();
