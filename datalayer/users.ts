import { InferModel } from 'drizzle-orm-mysql';
import { eq } from 'drizzle-orm/expressions';
import { users } from '~/models/users';
import { getConnection } from '~/utils/db';

export type DbUser = InferModel<typeof users>;

/**
 * SELECT id FROM users WHERE google_id = $1 LIMIT 1;
 */
export async function getUserByGoogleId(googleId: string): Promise<Pick<DbUser, 'id'> | undefined> {
	const db = await getConnection();

	const [user] = await db.users
		.select({ id: users.id })
		.where(eq(users.googleId, googleId))
		.limit(1)
		.execute();

	return user;
}

/**
 * INSERT INTO users (google_id) VALUES ($1);
 */
export async function createUser(googleId: string): Promise<void> {
	const db = await getConnection();

	await db.users
		.insert({ googleId })
		.execute();
}
