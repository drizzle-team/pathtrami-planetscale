import { sql } from 'drizzle-orm';
import { mySqlTable, serial, text, timestamp } from 'drizzle-orm-mysql';

export const users = mySqlTable('users', {
	id: serial('id').primaryKey(),
	googleId: text('google_id').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
});
