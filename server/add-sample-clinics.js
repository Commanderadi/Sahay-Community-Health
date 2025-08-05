const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');

// Sample clinic data
const sampleClinics = [
  {
    name: "Community Health Center - Downtown",
    city: "Mumbai",
    contact: "+91-22-2345-6789",
    addedBy: "Sahay Admin"
  },
  {
    name: "Primary Care Clinic",
    city: "Delhi",
    contact: "+91-11-3456-7890",
    addedBy: "Health NGO"
  },
  {
    name: "Rural Medical Center",
    city: "Bangalore",
    contact: "+91-80-4567-8901",
    addedBy: "Community Health Worker"
  },
  {
    name: "Women's Health Clinic",
    city: "Chennai",
    contact: "+91-44-5678-9012",
    addedBy: "Women's Health NGO"
  },
  {
    name: "Pediatric Care Center",
    city: "Kolkata",
    contact: "+91-33-6789-0123",
    addedBy: "Child Health Foundation"
  },
  {
    name: "Emergency Medical Services",
    city: "Hyderabad",
    contact: "+91-40-7890-1234",
    addedBy: "Emergency Response Team"
  },
  {
    name: "Mental Health Clinic",
    city: "Pune",
    contact: "+91-20-8901-2345",
    addedBy: "Mental Health NGO"
  },
  {
    name: "Dental Care Center",
    city: "Ahmedabad",
    contact: "+91-79-9012-3456",
    addedBy: "Dental Health Initiative"
  },
  {
    name: "Elderly Care Clinic",
    city: "Jaipur",
    contact: "+91-141-0123-4567",
    addedBy: "Senior Care Foundation"
  },
  {
    name: "Vaccination Center",
    city: "Lucknow",
    contact: "+91-522-1234-5678",
    addedBy: "Public Health Department"
  },
  {
    name: "Maternity Hospital",
    city: "Kanpur",
    contact: "+91-512-2345-6789",
    addedBy: "Maternal Health NGO"
  },
  {
    name: "Eye Care Clinic",
    city: "Nagpur",
    contact: "+91-712-3456-7890",
    addedBy: "Vision Care Foundation"
  },
  {
    name: "Physiotherapy Center",
    city: "Indore",
    contact: "+91-731-4567-8901",
    addedBy: "Rehabilitation NGO"
  },
  {
    name: "Ayurvedic Wellness Center",
    city: "Varanasi",
    contact: "+91-542-5678-9012",
    addedBy: "Traditional Medicine NGO"
  },
  {
    name: "Mobile Health Unit",
    city: "Patna",
    contact: "+91-612-6789-0123",
    addedBy: "Mobile Health Initiative"
  }
];

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://aditya123:aditya123@cluster0.pirxh3j.mongodb.net/sahay?retryWrites=true&w=majority';

async function addSampleClinics() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing clinics (optional - comment out if you want to keep existing ones)
    // await Clinic.deleteMany({});
    // console.log('🗑️ Cleared existing clinics');

    console.log('📝 Adding sample clinics...');
    
    for (let i = 0; i < sampleClinics.length; i++) {
      const clinic = new Clinic(sampleClinics[i]);
      await clinic.save();
      console.log(`✅ Added clinic ${i + 1}: ${clinic.name} in ${clinic.city}`);
    }

    console.log('\n🎉 Successfully added 15 sample clinics!');
    console.log('\n📊 Clinic Summary:');
    
    const totalClinics = await Clinic.countDocuments();
    console.log(`Total clinics in database: ${totalClinics}`);
    
    const cities = await Clinic.distinct('city');
    console.log(`Cities covered: ${cities.join(', ')}`);

    console.log('\n🏥 Sample clinics added:');
    sampleClinics.forEach((clinic, index) => {
      console.log(`${index + 1}. ${clinic.name} - ${clinic.city}`);
    });

  } catch (error) {
    console.error('❌ Error adding clinics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addSampleClinics(); 