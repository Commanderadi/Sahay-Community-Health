const mongoose = require('mongoose');

// Test different connection strings
const connectionStrings = [
  'mongodb+srv://aditya123:aditya123@cluster0.yyie7vv.mongodb.net/?retryWrites=true&w=majority',
  'mongodb+srv://aditya123:aditya123@cluster0.yyie7vv.mongodb.net/sahay?retryWrites=true&w=majority',
  'mongodb+srv://aditya123:aditya123@cluster0.yyie7vv.mongodb.net/test?retryWrites=true&w=majority'
];

async function testConnection(uri, name) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`URI: ${uri}`);
  
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ SUCCESS: Connected to MongoDB!');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing MongoDB Atlas Connection...\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], `Connection ${i + 1}`);
    if (success) {
      console.log('\n🎉 Found working connection!');
      break;
    }
  }
  
  console.log('\n📋 If all tests failed, please check:');
  console.log('1. Database user exists in MongoDB Atlas');
  console.log('2. Network access allows 0.0.0.0/0');
  console.log('3. Username and password are correct');
}

runTests(); 