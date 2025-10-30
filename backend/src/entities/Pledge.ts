import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Family } from './Family';
import { FamilyMember } from './FamilyMember';

export enum Currency {
  NIS = 'NIS',  // Primary currency (Israeli Shekel)
  USD = 'USD',  // US Dollar
  GBP = 'GBP'   // British Pound
}

@Entity('pledges')
export class Pledge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Pledge details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  amount!: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.NIS })
  @IsEnum(Currency)
  currency!: Currency;

  @Column({ type: 'text' })
  @IsString()
  description!: string;

  @Column({ type: 'date' })
  @IsDateString()
  date!: Date;

  @Column({ default: false })
  @IsBoolean()
  isAnonymous!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isAnnualPledge!: boolean;

  // Due date for the pledge
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  // Donation date (when the pledge was actually paid)
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  donationDate?: Date;

  // Pledge status
  @Column({ 
    type: 'enum', 
    enum: ['pending', 'partial', 'fulfilled', 'overdue', 'cancelled'],
    default: 'pending' 
  })
  @IsString()
  status!: 'pending' | 'partial' | 'fulfilled' | 'overdue' | 'cancelled';

  // Fulfillment details
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  fulfilledDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  fulfilledAmount?: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  // Event connections
  @Column({ type: 'json', nullable: true })
  @IsOptional()
  connectedEvents?: Array<{
    type: 'yahrzeit' | 'birthday' | 'anniversary' | 'siyum' | 'other'
    description: string
    date?: string
    dateType?: 'gregorian' | 'hebrew' | 'family_event'
    hebrewDate?: string
    familyEventId?: string
    memberId?: string
  }>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Family, family => family.pledges)
  @JoinColumn({ name: 'familyId' })
  family!: Family;

  @Column()
  familyId!: string;

  @ManyToOne(() => FamilyMember, { nullable: true })
  @JoinColumn({ name: 'familyMemberId' })
  familyMember?: FamilyMember; // Link to specific family member if available

  @Column({ nullable: true })
  familyMemberId?: string;

  // Helper methods
  getDisplayAmount(): string {
    const currencySymbols = {
      [Currency.NIS]: '₪',
      [Currency.USD]: '$',
      [Currency.GBP]: '£'
    };
    return `${currencySymbols[this.currency]}${this.amount.toFixed(2)}`;
  }

  isFulfilled(): boolean {
    return this.status === 'fulfilled';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  getDaysUntilDue(): number {
    const today = new Date();
    const pledgeDate = new Date(this.date);
    const diffTime = pledgeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
