import { sql } from 'drizzle-orm';
import {
	mySqlTable,
	serial,
	text,
	varchar,
	timestamp,
} from 'drizzle-orm-mysql';

export const placesImages = mySqlTable('places_images', {
	id: serial('id').primaryKey(),
	placeSlug: varchar('place_slug', 100).notNull(),
	url: text('url').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
});
