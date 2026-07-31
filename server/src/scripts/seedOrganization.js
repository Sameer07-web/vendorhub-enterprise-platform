const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../../.env' });

const Organization = require('../models/Organization');
const User = require('../models/User');

const seedOrganization = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Create the Demo Organization
    const orgData = {
      name: 'VendorHub Demo Organization',
      slug: 'vendorhub-demo',
      description: 'A sample organization for demonstration purposes.',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      industry: 'Technology',
      employeeCount: 500,
      currency: 'USD',
      timezone: 'America/New_York',
      settings: {
        branding: {
          primaryColor: '#0ea5e9',
          secondaryColor: '#f1f5f9'
        },
        aiEnabled: true,
      }
    };

    // First check if a user exists to be the owner
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    let owner = await User.findOne({ email: 'admin@vendorhub.demo' });
    if (!owner) {
      owner = new User({
        fullName: 'Demo Admin',
        email: 'admin@vendorhub.demo',
        password: hashedPassword,
        role: 'Admin',
        organizationRole: 'Owner'
      });
      // Do not save yet, we need organization ID.
    }

    let organization = await Organization.findOne({ slug: 'vendorhub-demo' });
    if (!organization) {
      organization = new Organization({
        ...orgData,
        owner: owner._id
      });
      await organization.save();
      console.log(`Created Organization: ${organization.name}`);
    }

    owner.organization = organization._id;
    await owner.save();
    console.log(`Created/Updated Owner: ${owner.email}`);

    console.log('Organization seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedOrganization();
