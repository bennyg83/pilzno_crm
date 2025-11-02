import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Family } from './Family';
import { FamilyMember } from './FamilyMember';
import { User } from './User';

export enum NoteType {
  // Legacy CRM types
  GENERAL = 'general',
  PHONE_CALL = 'phone_call',
  MEETING = 'meeting',
  EMAIL = 'email',
  FOLLOW_UP = 'follow_up',
  
  // Synagogue-specific types
  PASTORAL_CARE = 'pastoral_care',
  MEMBERSHIP = 'membership',
  LIFECYCLE_EVENT = 'lifecycle_event',
  DONATION = 'donation',
  VOLUNTEER = 'volunteer',
  EDUCATION = 'education',
  YOUTH = 'youth',
  COMMITTEE = 'committee',
  BOARD = 'board',
  SECURITY = 'security',
  FACILITIES = 'facilities',
  COMPLAINT = 'complaint',
  COMPLIMENT = 'compliment',
  YAHRZEIT = 'yahrzeit',
  SHIVA = 'shiva',
  SIMCHA = 'simcha',
  OTHER = 'other'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  title!: string;

  @Column({ type: 'text' })
  @IsString()
  content!: string;

  @Column({ type: 'enum', enum: NoteType, default: NoteType.GENERAL })
  @IsEnum(NoteType)
  type!: NoteType;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  @IsEnum(Priority)
  priority!: Priority;

  @Column({ default: false })
  isPrivate!: boolean;

  @Column({ default: false })
  requiresFollowUp!: boolean;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  followUpDate?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  tags?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Legacy CRM relationships (for backward compatibility)
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  accountId?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  contactId?: string;

  // New synagogue relationships
  @ManyToOne(() => Family, family => family.notes, { nullable: true })
  @JoinColumn({ name: 'familyId' })
  family?: Family;

  @Column({ nullable: true })
  familyId?: string;

  @ManyToOne(() => FamilyMember, member => member, { nullable: true })
  @JoinColumn({ name: 'familyMemberId' })
  familyMember?: FamilyMember;

  @Column({ nullable: true })
  familyMemberId?: string;

  // Author relationship
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  author?: User;

  @Column({ nullable: true })
  createdBy?: string;

  // Helper methods
  getDisplayTitle(): string {
    return this.title || `${this.getFormattedType()} Note`;
  }

  getFormattedType(): string {
    return this.type.replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  getRelatedEntity(): string {
    if (this.family) return `Family: ${this.family.familyName}`;
    if (this.familyMember) return `Member: ${this.familyMember.getFullName()}`;
    if (this.accountId) return `Account: ${this.accountId}`;
    if (this.contactId) return `Contact: ${this.contactId}`;
    return 'General Note';
  }

  isOverdue(): boolean {
    if (!this.requiresFollowUp || !this.followUpDate) return false;
    return new Date(this.followUpDate) < new Date();
  }

  isDueToday(): boolean {
    if (!this.requiresFollowUp || !this.followUpDate) return false;
    const today = new Date();
    const followUp = new Date(this.followUpDate);
    return followUp.toDateString() === today.toDateString();
  }

  isDueSoon(): boolean {
    if (!this.requiresFollowUp || !this.followUpDate) return false;
    const today = new Date();
    const followUp = new Date(this.followUpDate);
    const daysDiff = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  }

  getTagsArray(): string[] {
    return this.tags ? this.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  }

  hasTag(tag: string): boolean {
    return this.getTagsArray().includes(tag);
  }

  isSynagogueSpecific(): boolean {
    const synagogueTypes = [
      NoteType.PASTORAL_CARE,
      NoteType.MEMBERSHIP,
      NoteType.LIFECYCLE_EVENT,
      NoteType.DONATION,
      NoteType.VOLUNTEER,
      NoteType.EDUCATION,
      NoteType.YOUTH,
      NoteType.COMMITTEE,
      NoteType.BOARD,
      NoteType.YAHRZEIT,
      NoteType.SHIVA,
      NoteType.SIMCHA
    ];
    return synagogueTypes.includes(this.type);
  }
} 