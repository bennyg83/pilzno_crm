import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, IsString, MinLength, IsEnum, IsArray, IsBoolean, IsOptional } from 'class-validator';
import bcrypt from 'bcryptjs';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  // Family Management
  VIEW_FAMILIES = 'view_families',
  CREATE_FAMILIES = 'create_families',
  EDIT_FAMILIES = 'edit_families',
  DELETE_FAMILIES = 'delete_families',
  
  // Member Management
  VIEW_MEMBERS = 'view_members',
  CREATE_MEMBERS = 'create_members',
  EDIT_MEMBERS = 'edit_members',
  DELETE_MEMBERS = 'delete_members',
  
  // Financial Management
  VIEW_FINANCIAL = 'view_financial',
  CREATE_PLEDGES = 'create_pledges',
  EDIT_PLEDGES = 'edit_pledges',
  DELETE_PLEDGES = 'delete_pledges',
  VIEW_DONATIONS = 'view_donations',
  
  // Settings Management
  VIEW_SETTINGS = 'view_settings',
  MANAGE_USERS = 'manage_users',
  MANAGE_EMAIL_TEMPLATES = 'manage_email_templates',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  
  // Reports and Analytics
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  
  // Email Management
  SEND_EMAILS = 'send_emails',
  VIEW_EMAIL_HISTORY = 'view_email_history'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @IsString()
  @MinLength(6)
  password!: string;

  @Column()
  @IsString()
  firstName!: string;

  @Column()
  @IsString()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @Column('simple-array', { nullable: true })
  @IsArray()
  @IsOptional()
  permissions?: Permission[];

  @Column({ default: true })
  @IsBoolean()
  isActive!: boolean;

  @Column({ default: true })
  @IsBoolean()
  isFirstLogin!: boolean;

  @Column({ nullable: true })
  @IsOptional()
  lastLoginAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  profilePicture?: string;

  @Column({ nullable: true })
  @IsOptional()
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasPermission(permission: Permission): boolean {
    if (this.role === UserRole.SUPER_ADMIN) return true;
    if (this.role === UserRole.ADMIN) return true;
    return this.permissions?.includes(permission) || false;
  }

  canManageUsers(): boolean {
    return this.hasPermission(Permission.MANAGE_USERS) || this.role === UserRole.SUPER_ADMIN;
  }

  canManageEmailTemplates(): boolean {
    return this.hasPermission(Permission.MANAGE_EMAIL_TEMPLATES) || this.role === UserRole.SUPER_ADMIN;
  }

  // Password hashing hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) { // Only hash if not already hashed
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
} 