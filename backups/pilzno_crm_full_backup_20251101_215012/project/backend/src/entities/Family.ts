import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { FamilyTier } from './FamilyTier';
import { FamilyMember } from './FamilyMember';
import { Event } from './Event';
import { Donation } from './Donation';
import { Note } from './Note';
import { Email } from './Email';
import { Pledge } from './Pledge';

export enum MembershipStatus {
  MEMBER = 'member',
  PROSPECTIVE = 'prospective',
  VISITOR = 'visitor',
  FORMER = 'former'
}

export enum FamilyHealth {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEEDS_ATTENTION = 'needs-attention',
  AT_RISK = 'at-risk'
}

export enum Currency {
  NIS = 'NIS',  // Primary currency (Israeli Shekel)
  USD = 'USD',  // US Dollar
  GBP = 'GBP'   // British Pound
}

export interface PledgeData {
  amount: number
  currency: Currency
  description: string
  date: string
  pledgedBy: string // Family member who made the pledge
  isAnonymous: boolean // Whether the pledge should be anonymous
}

@Entity('families')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  familyName!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hebrewFamilyName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  // Address fields
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  // Membership information
  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.PROSPECTIVE })
  @IsEnum(MembershipStatus)
  membershipStatus!: MembershipStatus;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  membershipStartDate?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  membershipEndDate?: Date;

  // Financial information
  @Column({ type: 'enum', enum: Currency, default: Currency.NIS })
  @IsEnum(Currency)
  currency!: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  annualPledge!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  totalDonations!: number;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  lastDonationDate?: Date;

  // Contact and follow-up
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  lastContactDate?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: Date;

  // Wedding anniversary
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  weddingAnniversary?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  hebrewWeddingAnniversary?: string;

  // Family health and engagement
  @Column({ type: 'enum', enum: FamilyHealth, default: FamilyHealth.GOOD })
  @IsEnum(FamilyHealth)
  familyHealth!: FamilyHealth;

  // Special needs and notes
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  specialNeeds?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  familyNotes?: string;

  // Communication preferences
  @Column({ default: true })
  @IsBoolean()
  receiveNewsletter!: boolean;

  @Column({ default: true })
  @IsBoolean()
  receiveEventNotifications!: boolean;

  // Special status
  @Column({ default: false })
  @IsBoolean()
  isFoundingFamily!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isBoardFamily!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => FamilyTier, familyTier => familyTier.families, { nullable: true })
  @JoinColumn({ name: 'familyTierId' })
  familyTier?: FamilyTier;

  @Column({ nullable: true })
  familyTierId?: string;

  @OneToMany(() => FamilyMember, member => member.family, { cascade: true })
  members!: FamilyMember[];

  @OneToMany(() => Event, event => event.family)
  events!: Event[];

  @OneToMany(() => Donation, donation => donation.family)
  donations!: Donation[];

  @OneToMany(() => Note, note => note.family)
  notes!: Note[];

  @OneToMany(() => Email, email => email.family)
  emails!: Email[];

  @OneToMany(() => Pledge, pledge => pledge.family)
  pledges!: Pledge[];

  // Helper methods
  getDisplayName(): string {
    return this.hebrewFamilyName ? `${this.familyName} (${this.hebrewFamilyName})` : this.familyName;
  }

  getFullAddress(): string {
    const parts = [this.address, this.city, this.state, this.zipCode, this.country].filter(Boolean);
    return parts.join(', ');
  }

  getMemberCount(): number {
    return this.members?.length || 0;
  }

  getChildrenCount(): number {
    return this.members?.filter(member => member.isChild()).length || 0;
  }

  getHeadOfHousehold(): FamilyMember | undefined {
    return this.members?.find(member => member.isPrimaryContact) || this.members?.[0];
  }

  getPrimaryContact(): FamilyMember | undefined {
    return this.members?.find(member => member.isPrimaryContact) || this.getHeadOfHousehold();
  }
} 