import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/sistema_aposta'

const pool = mysql.createPool({
  uri: connectionString,
  waitForConnections: true,
  connectionLimit: 10,
  idleTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
})

export const db = drizzle(pool, { schema, mode: 'default' })

export { schema }
