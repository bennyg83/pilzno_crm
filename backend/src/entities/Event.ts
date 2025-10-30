import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Family } from './Family';
import { FamilyMember } from './FamilyMember';

export enum EventType {
  BAR_MITZVAH = 'bar_mitzvah',
  BAT_MITZVAH = 'bat_mitzvah',
  WEDDING = 'wedding',
  BABY_NAMING = 'baby_naming',
  BRIT_MILAH = 'brit_milah',
  YAHRZEIT = 'yahrzeit',
  BIRTHDAY = 'birthday',
  ANNIVERSARY = 'anniversary',
  COMMUNITY = 'community',
  HOLIDAY = 'holiday',
  SHABBAT = 'shabbat',
  OTHER = 'other'
}

export enum EventStatus {
  PLANNED = 'planned',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

export enum RecurrenceFrequency {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  HEBREW_YEARLY = 'hebrew_yearly'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  title!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'enum', enum: EventType, default: EventType.OTHER })
  @IsEnum(EventType)
  eventType!: EventType;

  @Column({ type: 'timestamp' })
  @IsDateString()
  dueDate!: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hebrewDate?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PLANNED })
  @IsEnum(EventStatus)
  status!: EventStatus;

  // Recurrence pattern
  @Column({ type: 'enum', enum: RecurrenceFrequency, default: RecurrenceFrequency.NONE })
  @IsEnum(RecurrenceFrequency)
  recurrencePattern!: RecurrenceFrequency;

  @Column({ nullable: true })
  @IsOptional()
  recurrenceEndDate?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Column({ default: false })
  isAllDay!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Family, family => family.events, { nullable: true })
  @JoinColumn({ name: 'familyId' })
  family?: Family;

  @Column({ nullable: true })
  familyId?: string;

  @ManyToOne(() => FamilyMember, member => member.events, { nullable: true })
  @JoinColumn({ name: 'familyMemberId' })
  familyMember?: FamilyMember;

  @Column({ nullable: true })
  familyMemberId?: string;

  // Helper methods
  isUpcoming(): boolean {
    return this.dueDate > new Date() && this.status !== EventStatus.COMPLETED;
  }

  isPast(): boolean {
    return this.dueDate < new Date();
  }

  isToday(): boolean {
    const today = new Date();
    const eventDate = new Date(this.dueDate);
    return eventDate.toDateString() === today.toDateString();
  }

  isThisWeek(): boolean {
    const today = new Date();
    const eventDate = new Date(this.dueDate);
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return eventDate >= weekStart && eventDate <= weekEnd;
  }

  isThisMonth(): boolean {
    const today = new Date();
    const eventDate = new Date(this.dueDate);
    return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
  }

  getDisplayTitle(): string {
    return this.hebrewDate ? `${this.title} (${this.hebrewDate})` : this.title;
  }

  isJewishLifecycleEvent(): boolean {
    return [
      EventType.BAR_MITZVAH,
      EventType.BAT_MITZVAH,
      EventType.WEDDING,
      EventType.BABY_NAMING,
      EventType.BRIT_MILAH,
      EventType.YAHRZEIT
    ].includes(this.eventType);
  }

  isRecurring(): boolean {
    return this.recurrencePattern !== RecurrenceFrequency.NONE;
  }
} 