import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsEnum, IsBoolean, IsArray, IsOptional, MinLength } from 'class-validator';
import { User } from './User';

export enum EmailTemplateCategory {
  REMINDER = 'reminder',
  NOTIFICATION = 'notification',
  ANNOUNCEMENT = 'announcement',
  CUSTOM = 'custom'
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsString()
  @MinLength(3)
  name!: string;

  @Column()
  @IsString()
  @MinLength(5)
  subject!: string;

  @Column('text')
  @IsString()
  @MinLength(10)
  body!: string;

  @Column('simple-array', { nullable: true })
  @IsArray()
  @IsOptional()
  variables?: string[];

  @Column({
    type: 'enum',
    enum: EmailTemplateCategory,
    default: EmailTemplateCategory.CUSTOM
  })
  @IsEnum(EmailTemplateCategory)
  category!: EmailTemplateCategory;

  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive!: boolean;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column({ nullable: true })
  @IsOptional()
  tags?: string;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Helper methods
  getVariableList(): string[] {
    if (!this.body) return [];
    
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(this.body)) !== null) {
      variables.push(match[1].trim());
    }
    
    return [...new Set(variables)]; // Remove duplicates
  }

  validateVariables(): boolean {
    const bodyVariables = this.getVariableList();
    const allowedVariables = this.variables || [];
    
    return bodyVariables.every(variable => allowedVariables.includes(variable));
  }

  renderTemplate(data: Record<string, any>): { subject: string; body: string } {
    let subject = this.subject;
    let body = this.body;
    
    // Replace variables in subject and body
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    });
    
    return { subject, body };
  }
}
