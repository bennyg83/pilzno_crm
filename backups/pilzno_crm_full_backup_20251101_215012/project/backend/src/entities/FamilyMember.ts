import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsEmail } from 'class-validator';
import { Family } from './Family';
import { Event } from './Event';
import { Donation } from './Donation';

export enum RelationshipInHouse {
  HUSBAND = 'husband',
  WIFE = 'wife',
  SON = 'son',
  DAUGHTER = 'daughter',
  SINGLE = 'single'
}

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Basic information
  @Column()
  @IsString()
  firstName!: string;

  @Column()
  @IsString()
  lastName!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  fullHebrewName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hebrewLastName?: string;

  // Contact information
  @Column({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  cellPhone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  // Demographics
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hebrewBirthDate?: string;

  @Column({ type: 'enum', enum: RelationshipInHouse, default: RelationshipInHouse.HUSBAND })
  @IsEnum(RelationshipInHouse)
  relationshipInHouse!: RelationshipInHouse;

  // Status flags
  @Column({ default: true })
  @IsBoolean()
  isActive!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isPrimaryContact!: boolean;

  // Parents' Hebrew names (for tefillin, aliyah to Torah, etc.)
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  mothersHebrewName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  fathersHebrewName?: string;

  // Jewish Heritage fields
  @Column({ default: false })
  @IsBoolean()
  isCohen!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isLevi!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isYisroel!: boolean;

  // Title (Rabbi, Dr., Mr., etc.)
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  aliyahDate?: Date;

  // Professional and community information
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  education?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  profession?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  synagogueRoles?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  skills?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  interests?: string;

  // Memorial fields
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfDeath?: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hebrewDeathDate?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  memorialInstructions?: string;

  // Contact preferences
  @Column({ default: true })
  @IsBoolean()
  receiveEmails!: boolean;

  @Column({ default: false })
  @IsBoolean()
  receiveTexts!: boolean;

  @Column({ default: false })
  @IsBoolean()
  emergencyContact!: boolean;

  // Health and accessibility
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  accessibilityNeeds?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Family, family => family.members)
  @JoinColumn({ name: 'familyId' })
  family!: Family;

  @Column()
  familyId!: string;

  @OneToMany(() => Event, event => event.familyMember)
  events!: Event[];

  @OneToMany(() => Donation, donation => donation.familyMember)
  donations!: Donation[];

  // Helper methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getHebrewFullName(): string {
    if (!this.fullHebrewName && !this.hebrewLastName) return '';
    return `${this.fullHebrewName || ''} ${this.hebrewLastName || ''}`.trim();
  }

  getDisplayName(): string {
    const englishName = this.getFullName();
    const hebrewName = this.getHebrewFullName();
    return hebrewName ? `${englishName} (${hebrewName})` : englishName;
  }

  getAge(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  isChild(): boolean {
    const age = this.getAge();
    return age !== null && age < 18;
  }

  isTeen(): boolean {
    const age = this.getAge();
    return age !== null && age >= 13 && age < 18;
  }

  isAdult(): boolean {
    const age = this.getAge();
    return age !== null && age >= 18;
  }

  isSenior(): boolean {
    const age = this.getAge();
    return age !== null && age >= 65;
  }

  isBirthdayThisMonth(): boolean {
    if (!this.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    return today.getMonth() === birthDate.getMonth();
  }

  isYahrzeitThisMonth(): boolean {
    if (!this.dateOfDeath) return false;
    const today = new Date();
    const deathDate = new Date(this.dateOfDeath);
    return today.getMonth() === deathDate.getMonth();
  }

  getLifeStage(): string {
    if (this.isChild()) return 'child';
    if (this.isTeen()) return 'teen';
    if (this.isSenior()) return 'senior';
    return 'adult';
  }

  getPriestlyStatus(): string | null {
    if (this.isCohen) return 'Cohen';
    if (this.isLevi) return 'Levi';
    return null;
  }
} 