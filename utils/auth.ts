import { NextApiRequest } from 'next';
import { oAuth2Client } from '~/pages/api/auth/google';

export async function decodeIdToken(
	idToken: string,
): Promise<string | undefined> {
	return oAuth2Client
		.verifyIdToken({
			idToken,
		})
		.then((ticket) => ticket.getUserId()!)
		.catch(() => undefined);
}

export async function getCurrentUserId(
	req: NextApiRequest,
): Promise<string | undefined> {
	const { authorization } = req.headers;
	if (!authorization) {
		return undefined;
	}

	const idToken = authorization.replace('Bearer ', '');

	return decodeIdToken(idToken);
}
