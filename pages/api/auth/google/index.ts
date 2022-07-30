import { NextApiRequest, NextApiResponse } from 'next';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { getConnection } from '~/utils/db';
import { decodeIdToken } from '~/utils/auth';
import { users } from '~/models/users';
import { eq } from 'drizzle-orm/expressions';

export const oAuth2Client = new OAuth2Client(
	process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	'postmessage',
);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Credentials | { message: string }>,
) {
	const { tokens } = await oAuth2Client.getToken(req.body.code);

	const db = await getConnection();
	const userId = (await decodeIdToken(tokens.id_token!))!;

	const [user] = await db.users
		.select({ id: users.id })
		.where(eq(users.googleId, userId))
		.limit(1)
		.execute();

	if (!user) {
		await db.users
			.insert({
				googleId: userId,
			})
			.execute();
	}

	res.status(200).json(tokens);
}
