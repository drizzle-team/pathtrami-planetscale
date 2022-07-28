import { sql } from 'drizzle-orm';
import {
	mySqlTable,
	text,
	varchar,
	timestamp,
	serial,
} from 'drizzle-orm-mysql';

export const placesImages = mySqlTable('places_images', {
	id: varchar('id').primaryKey(),
	placeSlug: varchar('place_slug', 100).notNull(),
	url: text('url').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	index: serial('index'),
});
