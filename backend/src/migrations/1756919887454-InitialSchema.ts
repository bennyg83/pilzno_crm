import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1756919887454 implements MigrationInterface {
    name = 'InitialSchema1756919887454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'manager', 'user', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "permissions" text, "isActive" boolean NOT NULL DEFAULT true, "isFirstLogin" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "profilePicture" character varying, "phone" character varying, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "family_tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "minimumDonation" numeric(10,2) NOT NULL DEFAULT '0', "benefits" text, "priorityLevel" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5aa5dd44539b9e531516238c902" UNIQUE ("name"), CONSTRAINT "PK_f66e45b1ecb04cf303889813231" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_eventtype_enum" AS ENUM('bar_mitzvah', 'bat_mitzvah', 'wedding', 'baby_naming', 'brit_milah', 'yahrzeit', 'birthday', 'anniversary', 'community', 'holiday', 'shabbat', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('planned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed')`);
        await queryRunner.query(`CREATE TYPE "public"."events_recurrencepattern_enum" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly', 'hebrew_yearly')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "eventType" "public"."events_eventtype_enum" NOT NULL DEFAULT 'other', "dueDate" TIMESTAMP NOT NULL, "hebrewDate" character varying, "location" character varying, "status" "public"."events_status_enum" NOT NULL DEFAULT 'planned', "recurrencePattern" "public"."events_recurrencepattern_enum" NOT NULL DEFAULT 'none', "recurrenceEndDate" TIMESTAMP, "notes" text, "isAllDay" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "familyId" uuid, "familyMemberId" uuid, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."donations_paymentmethod_enum" AS ENUM('cash', 'check', 'credit_card', 'bank_transfer', 'online', 'paypal', 'venmo', 'zelle', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."donations_donationtype_enum" AS ENUM('general', 'building', 'torah', 'memorial', 'holiday', 'education', 'youth', 'security', 'social_action', 'special_event', 'pledge', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."donations_recurringfrequency_enum" AS ENUM('one-time', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual')`);
        await queryRunner.query(`CREATE TABLE "donations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "donationDate" date NOT NULL, "paymentMethod" "public"."donations_paymentmethod_enum" NOT NULL DEFAULT 'other', "donationType" "public"."donations_donationtype_enum" NOT NULL DEFAULT 'general', "recurringFrequency" "public"."donations_recurringfrequency_enum" NOT NULL DEFAULT 'one-time', "fundName" character varying, "isAnonymous" boolean NOT NULL DEFAULT false, "receiptSent" boolean NOT NULL DEFAULT false, "checkNumber" character varying, "transactionId" character varying, "notes" text, "dedicationMessage" text, "honoringMemory" character varying, "isTaxDeductible" boolean NOT NULL DEFAULT true, "taxDeductibleAmount" numeric(10,2), "isRecurring" boolean NOT NULL DEFAULT false, "recurringStartDate" date, "recurringEndDate" date, "recurringDonationId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "familyId" uuid, "familyMemberId" uuid, CONSTRAINT "PK_c01355d6f6f50fc6d1b4a946abf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."family_members_relationshipinhouse_enum" AS ENUM('husband', 'wife', 'son', 'daughter', 'single')`);
        await queryRunner.query(`CREATE TABLE "family_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "fullHebrewName" character varying, "hebrewLastName" character varying, "email" character varying, "cellPhone" character varying, "whatsappNumber" character varying, "dateOfBirth" date, "hebrewBirthDate" character varying, "relationshipInHouse" "public"."family_members_relationshipinhouse_enum" NOT NULL DEFAULT 'husband', "isActive" boolean NOT NULL DEFAULT true, "isPrimaryContact" boolean NOT NULL DEFAULT false, "mothersHebrewName" character varying, "fathersHebrewName" character varying, "isCohen" boolean NOT NULL DEFAULT false, "isLevi" boolean NOT NULL DEFAULT false, "isYisroel" boolean NOT NULL DEFAULT false, "title" character varying, "aliyahDate" date, "education" text, "profession" text, "synagogueRoles" text, "skills" text, "interests" text, "dateOfDeath" date, "hebrewDeathDate" character varying, "memorialInstructions" text, "receiveEmails" boolean NOT NULL DEFAULT true, "receiveTexts" boolean NOT NULL DEFAULT false, "emergencyContact" boolean NOT NULL DEFAULT false, "medicalNotes" text, "accessibilityNeeds" text, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "familyId" uuid NOT NULL, CONSTRAINT "PK_186da7c7fcbf23775fdd888a747" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notes_type_enum" AS ENUM('general', 'phone_call', 'meeting', 'email', 'follow_up', 'pastoral_care', 'membership', 'lifecycle_event', 'donation', 'volunteer', 'education', 'youth', 'committee', 'board', 'security', 'facilities', 'complaint', 'compliment', 'yahrzeit', 'shiva', 'simcha', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."notes_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text NOT NULL, "type" "public"."notes_type_enum" NOT NULL DEFAULT 'general', "priority" "public"."notes_priority_enum" NOT NULL DEFAULT 'medium', "isPrivate" boolean NOT NULL DEFAULT false, "requiresFollowUp" boolean NOT NULL DEFAULT false, "followUpDate" date, "tags" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "accountId" character varying, "contactId" character varying, "familyId" uuid, "familyMemberId" uuid, "createdBy" uuid, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."emails_status_enum" AS ENUM('draft', 'sent', 'failed', 'scheduled')`);
        await queryRunner.query(`CREATE TYPE "public"."emails_emailtype_enum" AS ENUM('personal', 'newsletter', 'event_announcement', 'donation_receipt', 'membership', 'pastoral_care', 'lifecycle_event', 'holiday_greeting', 'yahrzeit_reminder', 'birthday_greeting', 'general_announcement', 'emergency', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."emails_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent')`);
        await queryRunner.query(`CREATE TABLE "emails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" character varying NOT NULL, "body" text NOT NULL, "fromEmail" character varying NOT NULL, "fromName" character varying, "toEmail" character varying NOT NULL, "toName" character varying, "ccEmails" text, "bccEmails" text, "status" "public"."emails_status_enum" NOT NULL DEFAULT 'draft', "emailType" "public"."emails_emailtype_enum" NOT NULL DEFAULT 'other', "priority" "public"."emails_priority_enum" NOT NULL DEFAULT 'normal', "sentAt" TIMESTAMP, "scheduledFor" TIMESTAMP, "isRead" boolean NOT NULL DEFAULT false, "isArchived" boolean NOT NULL DEFAULT false, "isImportant" boolean NOT NULL DEFAULT false, "isHtml" boolean NOT NULL DEFAULT false, "attachments" text, "notes" text, "errorMessage" text, "externalMessageId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "familyId" uuid, "familyMemberId" uuid, "sentBy" uuid, CONSTRAINT "PK_a54dcebef8d05dca7e839749571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pledges_currency_enum" AS ENUM('NIS', 'USD', 'GBP')`);
        await queryRunner.query(`CREATE TYPE "public"."pledges_status_enum" AS ENUM('pending', 'partial', 'fulfilled', 'overdue', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "pledges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "currency" "public"."pledges_currency_enum" NOT NULL DEFAULT 'NIS', "description" text NOT NULL, "date" date NOT NULL, "pledgedBy" character varying, "isAnonymous" boolean NOT NULL DEFAULT false, "status" "public"."pledges_status_enum" NOT NULL DEFAULT 'pending', "fulfilledDate" date, "fulfilledAmount" numeric(10,2), "notes" text, "connectedEvents" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "familyId" uuid NOT NULL, "familyMemberId" uuid, CONSTRAINT "PK_cbc41e4e1ba6b2690543f158d22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."families_membershipstatus_enum" AS ENUM('member', 'prospective', 'visitor', 'former')`);
        await queryRunner.query(`CREATE TYPE "public"."families_currency_enum" AS ENUM('NIS', 'USD', 'GBP')`);
        await queryRunner.query(`CREATE TYPE "public"."families_familyhealth_enum" AS ENUM('excellent', 'good', 'needs-attention', 'at-risk')`);
        await queryRunner.query(`CREATE TABLE "families" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyName" character varying NOT NULL, "hebrewFamilyName" character varying, "primaryEmail" character varying, "secondaryEmail" character varying, "phone" character varying, "emergencyContact" character varying, "address" character varying, "city" character varying, "state" character varying, "zipCode" character varying, "country" character varying, "membershipStatus" "public"."families_membershipstatus_enum" NOT NULL DEFAULT 'prospective', "membershipStartDate" date, "membershipEndDate" date, "currency" "public"."families_currency_enum" NOT NULL DEFAULT 'NIS', "annualPledge" numeric(10,2) NOT NULL DEFAULT '0', "totalDonations" numeric(10,2) NOT NULL DEFAULT '0', "lastDonationDate" date, "lastContactDate" date, "nextFollowUpDate" date, "weddingAnniversary" date, "hebrewWeddingAnniversary" character varying(100), "familyHealth" "public"."families_familyhealth_enum" NOT NULL DEFAULT 'good', "dietaryRestrictions" text, "specialNeeds" text, "familyNotes" text, "receiveNewsletter" boolean NOT NULL DEFAULT true, "receiveEventNotifications" boolean NOT NULL DEFAULT true, "isFoundingFamily" boolean NOT NULL DEFAULT false, "isBoardFamily" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "familyTierId" uuid, CONSTRAINT "PK_70414ac0c8f45664cf71324b9bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."additional_important_date_type_enum" AS ENUM('wedding_anniversary', 'aliyah_anniversary', 'other')`);
        await queryRunner.query(`CREATE TABLE "additional_important_date" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "type" "public"."additional_important_date_type_enum" NOT NULL DEFAULT 'wedding_anniversary', "description" character varying, "englishDate" date NOT NULL, "hebrewDate" character varying, "memberId" character varying, "memberName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dae0b260a66245399db06114532" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."email_templates_category_enum" AS ENUM('reminder', 'notification', 'announcement', 'custom')`);
        await queryRunner.query(`CREATE TABLE "email_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "subject" character varying NOT NULL, "body" text NOT NULL, "variables" text, "category" "public"."email_templates_category_enum" NOT NULL DEFAULT 'custom', "is_active" boolean NOT NULL DEFAULT true, "description" character varying, "tags" character varying, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e832fef7d0d7dd4da2792eddbf7" UNIQUE ("name"), CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_invitations_role_enum" AS ENUM('super_admin', 'admin', 'manager', 'user', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "user_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" "public"."user_invitations_role_enum" NOT NULL DEFAULT 'user', "permissions" text, "invited_by" uuid NOT NULL, "invited_at" TIMESTAMP NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_accepted" boolean NOT NULL DEFAULT false, "accepted_at" TIMESTAMP, "invitation_token" character varying, "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d818b0ebcc97ef5dfb67fb78674" UNIQUE ("email"), CONSTRAINT "PK_c8005acb91c3ce9a7ae581eca8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."system_settings_category_enum" AS ENUM('general', 'email', 'notifications', 'security', 'custom')`);
        await queryRunner.query(`CREATE TABLE "system_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" text NOT NULL, "description" character varying, "category" "public"."system_settings_category_enum" NOT NULL DEFAULT 'general', "is_editable" boolean NOT NULL DEFAULT true, "is_sensitive" boolean NOT NULL DEFAULT false, "validation" character varying, "updated_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b1b5bc664526d375c94ce9ad43d" UNIQUE ("key"), CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_a4f2982b9fe3d4c07290d19a240" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_79747610d71f2b43b811680989b" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "donations" ADD CONSTRAINT "FK_316e758547ee3a2d41b5083ed0f" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "donations" ADD CONSTRAINT "FK_c1c931a5d3f99f58aae0b827f37" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD CONSTRAINT "FK_8e1c2c602b66f79d1ac89f24d97" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_1b8117b0f3088903c71339f248e" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_ef6ee90bb11a55795d5dfe4169d" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_e3d861bb95b1f19c762b07001a8" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emails" ADD CONSTRAINT "FK_7b6616de52ad966658424706a2c" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emails" ADD CONSTRAINT "FK_cfbd1e71130f27cb0e4829679a7" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emails" ADD CONSTRAINT "FK_ac0ef443ea134e55c95a9442f03" FOREIGN KEY ("sentBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pledges" ADD CONSTRAINT "FK_584169262d919ec7cbb4dafcda5" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pledges" ADD CONSTRAINT "FK_17f2402a0d5d63224634c923ff0" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_4465caa2339f4ef9d128e81b956" FOREIGN KEY ("familyTierId") REFERENCES "family_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "additional_important_date" ADD CONSTRAINT "FK_3b05ea2ed037ab77c0c312ff633" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_templates" ADD CONSTRAINT "FK_68594bd43a94dfb8e0d7fd77b51" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_18241a1a2cb2d284716636b2340" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD CONSTRAINT "FK_301c531938f84c39fa5019e7465" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_settings" DROP CONSTRAINT "FK_301c531938f84c39fa5019e7465"`);
        await queryRunner.query(`ALTER TABLE "user_invitations" DROP CONSTRAINT "FK_18241a1a2cb2d284716636b2340"`);
        await queryRunner.query(`ALTER TABLE "email_templates" DROP CONSTRAINT "FK_68594bd43a94dfb8e0d7fd77b51"`);
        await queryRunner.query(`ALTER TABLE "additional_important_date" DROP CONSTRAINT "FK_3b05ea2ed037ab77c0c312ff633"`);
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_4465caa2339f4ef9d128e81b956"`);
        await queryRunner.query(`ALTER TABLE "pledges" DROP CONSTRAINT "FK_17f2402a0d5d63224634c923ff0"`);
        await queryRunner.query(`ALTER TABLE "pledges" DROP CONSTRAINT "FK_584169262d919ec7cbb4dafcda5"`);
        await queryRunner.query(`ALTER TABLE "emails" DROP CONSTRAINT "FK_ac0ef443ea134e55c95a9442f03"`);
        await queryRunner.query(`ALTER TABLE "emails" DROP CONSTRAINT "FK_cfbd1e71130f27cb0e4829679a7"`);
        await queryRunner.query(`ALTER TABLE "emails" DROP CONSTRAINT "FK_7b6616de52ad966658424706a2c"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_e3d861bb95b1f19c762b07001a8"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_ef6ee90bb11a55795d5dfe4169d"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_1b8117b0f3088903c71339f248e"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP CONSTRAINT "FK_8e1c2c602b66f79d1ac89f24d97"`);
        await queryRunner.query(`ALTER TABLE "donations" DROP CONSTRAINT "FK_c1c931a5d3f99f58aae0b827f37"`);
        await queryRunner.query(`ALTER TABLE "donations" DROP CONSTRAINT "FK_316e758547ee3a2d41b5083ed0f"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_79747610d71f2b43b811680989b"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_a4f2982b9fe3d4c07290d19a240"`);
        await queryRunner.query(`DROP TABLE "system_settings"`);
        await queryRunner.query(`DROP TYPE "public"."system_settings_category_enum"`);
        await queryRunner.query(`DROP TABLE "user_invitations"`);
        await queryRunner.query(`DROP TYPE "public"."user_invitations_role_enum"`);
        await queryRunner.query(`DROP TABLE "email_templates"`);
        await queryRunner.query(`DROP TYPE "public"."email_templates_category_enum"`);
        await queryRunner.query(`DROP TABLE "additional_important_date"`);
        await queryRunner.query(`DROP TYPE "public"."additional_important_date_type_enum"`);
        await queryRunner.query(`DROP TABLE "families"`);
        await queryRunner.query(`DROP TYPE "public"."families_familyhealth_enum"`);
        await queryRunner.query(`DROP TYPE "public"."families_currency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."families_membershipstatus_enum"`);
        await queryRunner.query(`DROP TABLE "pledges"`);
        await queryRunner.query(`DROP TYPE "public"."pledges_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pledges_currency_enum"`);
        await queryRunner.query(`DROP TABLE "emails"`);
        await queryRunner.query(`DROP TYPE "public"."emails_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."emails_emailtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."emails_status_enum"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`DROP TYPE "public"."notes_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notes_type_enum"`);
        await queryRunner.query(`DROP TABLE "family_members"`);
        await queryRunner.query(`DROP TYPE "public"."family_members_relationshipinhouse_enum"`);
        await queryRunner.query(`DROP TABLE "donations"`);
        await queryRunner.query(`DROP TYPE "public"."donations_recurringfrequency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."donations_donationtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."donations_paymentmethod_enum"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_recurrencepattern_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_eventtype_enum"`);
        await queryRunner.query(`DROP TABLE "family_tiers"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
