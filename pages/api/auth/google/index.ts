import { Credentials, OAuth2Client } from 'google-auth-library';
import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, getUserByGoogleId } from '~/datalayer/users';
import { decodeIdToken } from '~/utils/auth';

export const oAuth2Client = new OAuth2Client(
	process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	'postmessage',
);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Credentials | { message: string; }>,
) {
	const { tokens } = await oAuth2Client.getToken(req.body.code);

	const userId = (await decodeIdToken(tokens.id_token!))!;

	const user = await getUserByGoogleId(userId);

	if (!user) {
		await createUser(userId);
	}

	res.status(200).json(tokens);
}
