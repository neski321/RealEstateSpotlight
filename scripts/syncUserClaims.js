import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // or use cert() if you have a service account key file
});

// Connect to your database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set this in your environment
});

async function main() {
  // Get all users from your DB
  const { rows: users } = await pool.query('SELECT id, roles, "current_role" FROM users');
  for (const user of users) {
    try {
      await admin.auth().setCustomUserClaims(user.id, {
        roles: user.roles,
        currentRole: user.current_role,
      });
      console.log(`Updated claims for ${user.id}`);
    } catch (err) {
      console.error(`Failed to update claims for ${user.id}:`, err.message);
    }
  }
  await pool.end();
}

main().then(() => {
  console.log('All user claims updated.');
  process.exit(0);
}); 