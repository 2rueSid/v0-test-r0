import { sql } from "../lib/db"
import { readFileSync } from "fs"
import { join } from "path"

async function runMigrations() {
  console.log("Starting database migrations...")

  try {
    // Create users table
    console.log("Creating users table...")
    const usersSQL = readFileSync(join(process.cwd(), "scripts", "001_create_users_table.sql"), "utf8")
    await sql.unsafe(usersSQL)
    console.log("✅ Users table created successfully")

    // Create files table
    console.log("Creating files table...")
    const filesSQL = readFileSync(join(process.cwd(), "scripts", "002_create_files_table.sql"), "utf8")
    await sql.unsafe(filesSQL)
    console.log("✅ Files table created successfully")

    console.log("🎉 All migrations completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

runMigrations()
