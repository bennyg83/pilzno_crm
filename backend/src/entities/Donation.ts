import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Family } from './Family';
import { FamilyMember } from './FamilyMember';

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
  PAYPAL = 'paypal',
  VENMO = 'venmo',
  ZELLE = 'zelle',
  OTHER = 'other'
}

export enum DonationType {
  GENERAL = 'general',
  BUILDING = 'building',
  TORAH = 'torah',
  MEMORIAL = 'memorial',
  HOLIDAY = 'holiday',
  EDUCATION = 'education',
  YOUTH = 'youth',
  SECURITY = 'security',
  SOCIAL_ACTION = 'social_action',
  SPECIAL_EVENT = 'special_event',
  PLEDGE = 'pledge',
  OTHER = 'other'
}

export enum RecurringFrequency {
  ONE_TIME = 'one-time',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi-annual',
  ANNUAL = 'annual'
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  amount!: number;

  @Column({ type: 'date' })
  @IsDateString()
  donationDate!: Date;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.OTHER })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Column({ type: 'enum', enum: DonationType, default: DonationType.GENERAL })
  @IsEnum(DonationType)
  donationType!: DonationType;

  @Column({ type: 'enum', enum: RecurringFrequency, default: RecurringFrequency.ONE_TIME })
  @IsEnum(RecurringFrequency)
  recurringFrequency!: RecurringFrequency;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  fundName?: string;

  @Column({ default: false })
  @IsBoolean()
  isAnonymous!: boolean;

  @Column({ default: false })
  @IsBoolean()
  receiptSent!: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  checkNumber?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  dedicationMessage?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  honoringMemory?: string;

  // Tax information
  @Column({ default: true })
  @IsBoolean()
  isTaxDeductible!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  taxDeductibleAmount?: number;

  // Recurring donation fields
  @Column({ default: false })
  @IsBoolean()
  isRecurring!: boolean;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  recurringStartDate?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  recurringEndDate?: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  recurringDonationId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Family, family => family.donations, { nullable: true })
  @JoinColumn({ name: 'familyId' })
  family?: Family;

  @Column({ nullable: true })
  familyId?: string;

  @ManyToOne(() => FamilyMember, member => member.donations, { nullable: true })
  @JoinColumn({ name: 'familyMemberId' })
  familyMember?: FamilyMember;

  @Column({ nullable: true })
  familyMemberId?: string;

  // Helper methods
  getDisplayAmount(): string {
    return `$${this.amount.toFixed(2)}`;
  }

  getDonorName(): string {
    if (this.isAnonymous) return 'Anonymous';
    if (this.familyMember) return this.familyMember.getFullName();
    if (this.family) return this.family.familyName;
    return 'Unknown Donor';
  }

  isThisYear(): boolean {
    const currentYear = new Date().getFullYear();
    return new Date(this.donationDate).getFullYear() === currentYear;
  }

  isThisMonth(): boolean {
    const today = new Date();
    const donationDate = new Date(this.donationDate);
    return donationDate.getMonth() === today.getMonth() && 
           donationDate.getFullYear() === today.getFullYear();
  }

  getQuarter(): number {
    const month = new Date(this.donationDate).getMonth();
    return Math.floor(month / 3) + 1;
  }

  isMemorialDonation(): boolean {
    return this.donationType === DonationType.MEMORIAL || !!this.honoringMemory;
  }

  requiresReceipt(): boolean {
    return this.isTaxDeductible && !this.receiptSent && this.amount >= 250;
  }

  getFormattedDonationType(): string {
    return this.donationType.replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
} 