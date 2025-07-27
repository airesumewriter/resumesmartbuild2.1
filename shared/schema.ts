import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, decimal, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  scansRemaining: integer('scans_remaining').default(3).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// Templates table
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  isFree: boolean('is_free').default(true).notNull(),
  previewUrl: varchar('preview_url', { length: 500 }),
  templateData: jsonb('template_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  isFreeIdx: index('is_free_idx').on(table.isFree),
}));

// Resumes table
export const resumes = pgTable('resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  templateId: uuid('template_id').references(() => templates.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content').notNull(),
  lastScanDate: timestamp('last_scan_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
}));

// Scans table
export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id).notNull(),
  score: integer('score').notNull(),
  suggestions: jsonb('suggestions').notNull(),
  keywords: jsonb('keywords'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  resumeIdIdx: index('resume_id_idx').on(table.resumeId),
  scoreIdx: index('score_idx').on(table.score),
}));

// Jobs table
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  salaryMin: decimal('salary_min', { precision: 10, scale: 2 }),
  salaryMax: decimal('salary_max', { precision: 10, scale: 2 }),
  isRemote: boolean('is_remote').default(false).notNull(),
  description: text('description').notNull(),
  requirements: jsonb('requirements'),
  applyUrl: varchar('apply_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  locationIdx: index('location_idx').on(table.location),
  isRemoteIdx: index('is_remote_idx').on(table.isRemote),
}));

// Job matches table
export const jobMatches = pgTable('job_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id).notNull(),
  jobId: uuid('job_id').references(() => jobs.id).notNull(),
  matchScore: decimal('match_score', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  resumeJobIdx: index('resume_job_idx').on(table.resumeId, table.jobId),
  matchScoreIdx: index('match_score_idx').on(table.matchScore),
}));

// Cover letters table
export const coverLetters = pgTable('cover_letters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  resumeId: uuid('resume_id').references(() => resumes.id),
  jobId: uuid('job_id').references(() => jobs.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('cover_letters_user_id_idx').on(table.userId),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertResumeSchema = createInsertSchema(resumes);
export const selectResumeSchema = createSelectSchema(resumes);
export const insertTemplateSchema = createInsertSchema(templates);
export const selectTemplateSchema = createSelectSchema(templates);
export const insertScanSchema = createInsertSchema(scans);
export const selectScanSchema = createSelectSchema(scans);
export const insertJobSchema = createInsertSchema(jobs);
export const selectJobSchema = createSelectSchema(jobs);
export const insertCoverLetterSchema = createInsertSchema(coverLetters);
export const selectCoverLetterSchema = createSelectSchema(coverLetters);

// Type exports
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Resume = z.infer<typeof selectResumeSchema>;
export type NewResume = z.infer<typeof insertResumeSchema>;
export type Template = z.infer<typeof selectTemplateSchema>;
export type NewTemplate = z.infer<typeof insertTemplateSchema>;
export type Scan = z.infer<typeof selectScanSchema>;
export type NewScan = z.infer<typeof insertScanSchema>;
export type Job = z.infer<typeof selectJobSchema>;
export type NewJob = z.infer<typeof insertJobSchema>;
export type CoverLetter = z.infer<typeof selectCoverLetterSchema>;
export type NewCoverLetter = z.infer<typeof insertCoverLetterSchema>;