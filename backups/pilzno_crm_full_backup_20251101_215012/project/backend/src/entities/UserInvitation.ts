import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsEmail, IsString, IsEnum, IsArray, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { User, UserRole, Permission } from './User';

@Entity('user_invitations')
export class UserInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ name: 'first_name' })
  @IsString()
  firstName!: string;

  @Column({ name: 'last_name' })
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

  @Column({ name: 'invited_by' })
  invitedBy!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  inviter!: User;

  @Column({ name: 'invited_at' })
  @IsDateString()
  invitedAt!: Date;

  @Column({ name: 'expires_at' })
  @IsDateString()
  expiresAt!: Date;

  @Column({ name: 'is_accepted', default: false })
  @IsBoolean()
  isAccepted!: boolean;

  @Column({ name: 'accepted_at', nullable: true })
  @IsOptional()
  @IsDateString()
  acceptedAt?: Date;

  @Column({ name: 'invitation_token', nullable: true })
  @IsOptional()
  @IsString()
  invitationToken?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Helper methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canAccept(): boolean {
    return !this.isExpired() && !this.isAccepted;
  }

  getDaysUntilExpiry(): number {
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  generateInvitationToken(): string {
    // Generate a secure random token
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    this.invitationToken = token;
    return token;
  }
}
