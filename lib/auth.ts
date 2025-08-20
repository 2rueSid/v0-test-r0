import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  last_signed_in_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, first_name, last_name, last_signed_in_at, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, first_name, last_name, last_signed_in_at, created_at, updated_at
      FROM users 
      WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Update last signed in timestamp
export async function updateLastSignedIn(userId: string): Promise<void> {
  try {
    await sql`
      UPDATE users 
      SET last_signed_in_at = NOW(), updated_at = NOW()
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error("Error updating last signed in:", error)
  }
}
