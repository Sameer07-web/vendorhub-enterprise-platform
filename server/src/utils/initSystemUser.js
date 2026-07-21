const User = require('../models/User');

const initSystemUser = async () => {
  try {
    let systemUser = await User.findOne({ role: 'SYSTEM' });
    
    if (!systemUser) {
      systemUser = await User.create({
        fullName: 'VendorHub System',
        email: 'system@vendorhub.local',
        password: 'SecureSystemPassword!2026', // Required by schema but login not allowed for this role
        role: 'SYSTEM',
        isActive: true
      });
      console.log('✅ System User created.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize System User:', error.message);
  }
};

module.exports = initSystemUser;
