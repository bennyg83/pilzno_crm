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
    
    // Hash the new password: pilzno2024
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('pilzno2024', saltRounds);
    
    user.password = hashedPassword;
    await userRepository.save(user);
    
    console.log('✅ Password reset successfully!');
    console.log('   Email: admin@pilzno.org');
    console.log('   Password: pilzno2024');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

