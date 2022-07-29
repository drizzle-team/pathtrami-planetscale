import { sql } from 'drizzle-orm';
import { float, mySqlTable, text, timestamp, varchar } from 'drizzle-orm-mysql';

export const places = mySqlTable('places', {
	slug: varchar('slug', 100).notNull().primaryKey(),
	name: text('name').notNull(),
	address: text('address').notNull(),
	description: text('description').notNull().default(''),
	lat: float('lat').notNull(),
	lng: float('lng').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	createdBy: text('created_by').notNull(),
});
