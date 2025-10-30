import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Family } from './Family'

export type AdditionalDateType = 'wedding_anniversary' | 'aliyah_anniversary' | 'other'

@Entity()
export class AdditionalImportantDate {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  familyId: string

  @Column({
    type: 'enum',
    enum: ['wedding_anniversary', 'aliyah_anniversary', 'other'],
    default: 'wedding_anniversary'
  })
  type: AdditionalDateType

  @Column({ nullable: true })
  description: string

  @Column({ type: 'date' })
  englishDate: string

  @Column({ nullable: true })
  hebrewDate: string

  @Column({ nullable: true })
  memberId: string

  @Column({ nullable: true })
  memberName: string

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
