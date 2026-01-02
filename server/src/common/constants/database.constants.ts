/**
 * Database Configuration Constants
 * Contains MongoDB connection settings and database naming
 */

export const DATABASE = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/codenotify',
  DB_NAME:
    process.env.NODE_ENV === 'dev'
      ? `${process.env.DB_NAME || 'codenotify'}-dev`
      : process.env.DB_NAME || 'codenotify',
} as const;

/**
 * Get database name based on environment (runtime evaluation)
 * @param nodeEnv - The NODE_ENV value (e.g., 'dev', 'production')
 * @param baseDbName - The base database name (defaults to 'codenotify')
 * @returns The database name with -dev suffix if in development mode
 */
export function getDatabaseName(
  nodeEnv: string = 'dev',
  baseDbName: string = 'codenotify',
): string {
  return nodeEnv === 'dev' ? `${baseDbName}-dev` : baseDbName;
}

/**
 * Legacy export for backward compatibility
 */
export const DB_NAME = DATABASE.DB_NAME;
