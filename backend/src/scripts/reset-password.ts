import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

async function resetPassword() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: 'admin@pilzno.org' } });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:', user.email);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('pilzno2024', 12);
    
    user.password = hashedPassword;
    await userRepository.save(user);
    
    console.log('✅ Password reset successfully!');
    console.log('   Email: admin@pilzno.org');
    console.log('   Password: pilzno2024');
    
    // Verify it works
    const isValid = await bcrypt.compare('pilzno2024', user.password);
    console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

