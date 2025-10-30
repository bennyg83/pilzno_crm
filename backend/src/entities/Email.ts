import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsEmail, IsBoolean, IsDateString } from 'class-validator';
import { Family } from './Family';
import { FamilyMember } from './FamilyMember';
import { User } from './User';

export enum EmailStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  FAILED = 'failed',
  SCHEDULED = 'scheduled'
}

export enum EmailType {
  PERSONAL = 'personal',
  NEWSLETTER = 'newsletter',
  EVENT_ANNOUNCEMENT = 'event_announcement',
  DONATION_RECEIPT = 'donation_receipt',
  MEMBERSHIP = 'membership',
  PASTORAL_CARE = 'pastoral_care',
  LIFECYCLE_EVENT = 'lifecycle_event',
  HOLIDAY_GREETING = 'holiday_greeting',
  YAHRZEIT_REMINDER = 'yahrzeit_reminder',
  BIRTHDAY_GREETING = 'birthday_greeting',
  GENERAL_ANNOUNCEMENT = 'general_announcement',
  EMERGENCY = 'emergency',
  OTHER = 'other'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  subject!: string;

  @Column({ type: 'text' })
  @IsString()
  body!: string;

  @Column()
  @IsEmail()
  fromEmail!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  fromName?: string;

  @Column()
  @IsEmail()
  toEmail!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  toName?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  ccEmails?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  bccEmails?: string;

  @Column({ type: 'enum', enum: EmailStatus, default: EmailStatus.DRAFT })
  @IsEnum(EmailStatus)
  status!: EmailStatus;

  @Column({ type: 'enum', enum: EmailType, default: EmailType.OTHER })
  @IsEnum(EmailType)
  emailType!: EmailType;

  @Column({ type: 'enum', enum: Priority, default: Priority.NORMAL })
  @IsEnum(Priority)
  priority!: Priority;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDateString()
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;

  @Column({ default: false })
  @IsBoolean()
  isRead!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isArchived!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isImportant!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isHtml!: boolean;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  attachments?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  externalMessageId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Family, family => family.emails, { nullable: true })
  @JoinColumn({ name: 'familyId' })
  family?: Family;

  @Column({ nullable: true })
  familyId?: string;

  @ManyToOne(() => FamilyMember, member => member, { nullable: true })
  @JoinColumn({ name: 'familyMemberId' })
  familyMember?: FamilyMember;

  @Column({ nullable: true })
  familyMemberId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sentBy' })
  sender?: User;

  @Column({ nullable: true })
  sentBy?: string;

  // Helper methods
  getDisplaySubject(): string {
    if (this.priority === Priority.URGENT) return `[URGENT] ${this.subject}`;
    if (this.priority === Priority.HIGH) return `[HIGH] ${this.subject}`;
    return this.subject;
  }

  getFormattedType(): string {
    return this.emailType.replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  getRecipientName(): string {
    if (this.toName) return this.toName;
    if (this.familyMember) return this.familyMember.getFullName();
    if (this.family) return this.family.familyName;
    return this.toEmail;
  }

  isSent(): boolean {
    return this.status === EmailStatus.SENT;
  }

  isFailed(): boolean {
    return this.status === EmailStatus.FAILED;
  }

  isScheduled(): boolean {
    return this.status === EmailStatus.SCHEDULED;
  }

  isDraft(): boolean {
    return this.status === EmailStatus.DRAFT;
  }

  isOverdue(): boolean {
    if (!this.scheduledFor || this.status !== EmailStatus.SCHEDULED) return false;
    return new Date(this.scheduledFor) < new Date();
  }

  getCcEmailsArray(): string[] {
    return this.ccEmails ? this.ccEmails.split(',').map(email => email.trim()).filter(Boolean) : [];
  }

  getBccEmailsArray(): string[] {
    return this.bccEmails ? this.bccEmails.split(',').map(email => email.trim()).filter(Boolean) : [];
  }

  getAttachmentsArray(): string[] {
    return this.attachments ? this.attachments.split(',').map(attachment => attachment.trim()).filter(Boolean) : [];
  }

  hasAttachments(): boolean {
    return this.getAttachmentsArray().length > 0;
  }

  getBodyPreview(length: number = 100): string {
    if (this.isHtml) {
      // Simple HTML tag removal for preview
      const textBody = this.body.replace(/<[^>]*>/g, '');
      return textBody.length > length ? `${textBody.substring(0, length)}...` : textBody;
    }
    return this.body.length > length ? `${this.body.substring(0, length)}...` : this.body;
  }

  isJewishLifecycleEmail(): boolean {
    return [
      EmailType.LIFECYCLE_EVENT,
      EmailType.YAHRZEIT_REMINDER,
      EmailType.HOLIDAY_GREETING,
      EmailType.BIRTHDAY_GREETING,
      EmailType.PASTORAL_CARE
    ].includes(this.emailType);
  }

  getRelatedEntity(): string {
    if (this.family) return `Family: ${this.family.familyName}`;
    if (this.familyMember) return `Member: ${this.familyMember.getFullName()}`;
    return 'General Email';
  }
} 