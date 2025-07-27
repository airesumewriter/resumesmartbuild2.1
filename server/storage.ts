import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Create the connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export all tables for easier access
export const {
  users,
  templates,
  resumes,
  scans,
  jobs,
  jobMatches,
  coverLetters
} = schema;