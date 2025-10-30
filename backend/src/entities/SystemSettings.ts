import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { User } from './User';

export enum SystemSettingCategory {
  GENERAL = 'general',
  EMAIL = 'email',
  NOTIFICATIONS = 'notifications',
  SECURITY = 'security',
  CUSTOM = 'custom'
}

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsString()
  key!: string;

  @Column('text')
  @IsString()
  value!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({
    type: 'enum',
    enum: SystemSettingCategory,
    default: SystemSettingCategory.GENERAL
  })
  @IsEnum(SystemSettingCategory)
  category!: SystemSettingCategory;

  @Column({ name: 'is_editable', default: true })
  @IsBoolean()
  isEditable!: boolean;

  @Column({ name: 'is_sensitive', default: false })
  @IsBoolean()
  isSensitive!: boolean; // For passwords, API keys, etc.

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  validation?: string; // JSON validation rules

  @Column({ name: 'updated_by' })
  updatedBy!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updater!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Helper methods
  getValueAs<T>(): T {
    try {
      return JSON.parse(this.value) as T;
    } catch {
      return this.value as unknown as T;
    }
  }

  setValue(value: any): void {
    if (typeof value === 'object') {
      this.value = JSON.stringify(value);
    } else {
      this.value = String(value);
    }
  }

  isBoolean(): boolean {
    return this.value === 'true' || this.value === 'false';
  }

  isNumber(): boolean {
    return !isNaN(Number(this.value));
  }

  isJson(): boolean {
    try {
      JSON.parse(this.value);
      return true;
    } catch {
      return false;
    }
  }
}
