// Script to reset admin password
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('../backend/src/data-source');
const { User } = require('../backend/src/entities/User');

async function resetPassword() {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { email: 'admin@pilzno.org' } });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    // Get password from environment variable or command line argument
    const newPassword = process.env.ADMIN_PASSWORD || process.argv[2];
    if (!newPassword) {
      console.error('❌ Password required. Set ADMIN_PASSWORD env var or pass as argument.');
      console.error('   Usage: ADMIN_PASSWORD=yourpassword node reset-admin-password.js');
      console.error('   Or: node reset-admin-password.js yourpassword');
      process.exit(1);
    }
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    user.password = hashedPassword;
    await userRepository.save(user);
    
    console.log('✅ Password reset successfully!');
    console.log('   Email: admin@pilzno.org');
    console.log('   Password: [REDACTED - check your environment variable]');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

