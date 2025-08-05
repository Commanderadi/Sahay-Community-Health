const mongoose = require('mongoose');

console.log('🔍 Testing basic MongoDB connection...');

// Try to connect with minimal options
mongoose.connect('mongodb+srv://aditya123:aditya123@cluster0.pirxh3j.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
  console.log('🎉 Your Sahay application is ready to run!');
  process.exit(0);
})
.catch((error) => {
  console.log('❌ Connection failed:', error.message);
  console.log('\n📋 Please check:');
  console.log('1. Cluster name is correct');
  console.log('2. Database user exists');
  console.log('3. Network access is configured');
  console.log('4. Get the exact connection string from MongoDB Atlas');
  process.exit(1);
}); 