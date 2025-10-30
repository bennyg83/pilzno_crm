import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Family } from './entities/Family';
import { FamilyMember } from './entities/FamilyMember';
import { FamilyTier } from './entities/FamilyTier';
import { Event } from './entities/Event';
import { Donation } from './entities/Donation';
import { Note } from './entities/Note';
import { Email } from './entities/Email';
import { Pledge } from './entities/Pledge';
import { AdditionalImportantDate } from './entities/AdditionalImportantDate';
import { EmailTemplate } from './entities/EmailTemplate';
import { UserInvitation } from './entities/UserInvitation';
import { SystemSettings } from './entities/SystemSettings';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'pilzno-synagogue-db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'synagogue_admin',
  password: process.env.DB_PASSWORD || 'synagogue_secure_pass',
  database: process.env.DB_NAME || 'pilzno_synagogue',
  synchronize: false, // Disabled to prevent data loss on restart
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Family,
    FamilyMember,
    FamilyTier,
    Event,
    Donation,
    Note,
    Email,
    Pledge,
    AdditionalImportantDate,
    EmailTemplate,
    UserInvitation,
    SystemSettings
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
}); 