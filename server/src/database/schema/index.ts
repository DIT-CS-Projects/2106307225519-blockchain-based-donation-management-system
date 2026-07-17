// Drizzle table schemas live here, one file per domain (users, campaigns,
// donations, disbursements, ...). Re-export them all from this barrel so the
// Drizzle client and drizzle-kit see the full schema.
export * from './campaigns'
