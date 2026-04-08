const mongoose = require('mongoose');
require('dotenv').config({ path: 'v:/FITURDAY/backend/.env' });

async function testAtlas() {
    console.log('Testing connection to MongoDB Atlas...');
    console.log('URI:', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB Atlas!');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

testAtlas();
