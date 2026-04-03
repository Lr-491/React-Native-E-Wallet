import { neon } from "@neondatabase/serverless"

import "dotenv/config";


//Create a SQL connection using DB url
export const sql = neon(process.env.DATABASE_URL);


export default async function initDB() {
   try {
      await sql`CREATE TABLE IF NOT EXISTS transaction(
         id SERIAL PRIMARY KEY,
         user_id VARCHAR(255) NOT NULL,
         title VARCHAR(255) NOT NULL,
         amount DECIMAL(10,2) NOT NULL,
         category VARCHAR(255) NOT NULL,
         created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )`;
      console.log("DATABASE INITIALIZED SUCCEFULLY")
   } catch (error) {
      console.log("Error initializing DB", error);
      process.exit(1); // status code 1 means failure, 0 succes
   }
};
