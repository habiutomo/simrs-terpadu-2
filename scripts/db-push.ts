import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Pushing schema to database...");
  
  try {
    // Create tables based on the schema
    for (const table of Object.values(schema)) {
      if (table && typeof table === 'object' && 'name' in table) {
        try {
          // Using raw SQL to create tables if they don't exist
          const tableName = table.name;
          console.log(`Creating table: ${tableName}...`);
          
          // This is a simplified approach - in production you would use proper migrations
          const createTableSQL = db.dialect.schemaBuilder().createIfNotExistsTable(table).generateSQL()[0];
          await db.execute(createTableSQL);
          
          console.log(`Table ${tableName} created successfully.`);
        } catch (error) {
          console.error(`Error creating table:`, error);
        }
      }
    }
    
    console.log("Database schema push completed successfully!");
  } catch (error) {
    console.error("Error pushing schema to database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();