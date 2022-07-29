import { NextApiRequest, NextApiResponse } from 'next';
import { Credentials, UserRefreshClient } from 'google-auth-library';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Credentials | { message: string }>,
) {
	const { authorization } = req.headers;
	if (!authorization) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const user = new UserRefreshClient(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		authorization.replace('Bearer ', ''),
	);
	const { credentials } = await user.refreshAccessToken();
	res.status(200).json(credentials);
}
