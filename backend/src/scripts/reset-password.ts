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
    
    // Get password from environment variable or prompt
    const newPassword = process.env.ADMIN_PASSWORD || process.argv[2];
    if (!newPassword) {
      console.error('❌ Password required. Set ADMIN_PASSWORD env var or pass as argument.');
      console.error('   Usage: ADMIN_PASSWORD=yourpassword node reset-password.ts');
      console.error('   Or: node reset-password.ts yourpassword');
      process.exit(1);
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    await userRepository.save(user);
    
    console.log('✅ Password reset successfully!');
    console.log('   Email: admin@pilzno.org');
    console.log('   Password: [REDACTED - check your environment variable]');
    
    // Verify it works
    const isValid = await bcrypt.compare(newPassword, user.password);
    console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();

