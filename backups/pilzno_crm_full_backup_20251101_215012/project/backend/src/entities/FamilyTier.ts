import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Family } from './Family';

@Entity('family_tiers')
export class FamilyTier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsString()
  name!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  minimumDonation!: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  benefits?: string;

  @Column({ default: 1 })
  @IsNumber()
  priorityLevel!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Family, family => family.familyTier)
  families!: Family[];
} 