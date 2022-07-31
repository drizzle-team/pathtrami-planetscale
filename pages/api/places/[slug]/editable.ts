import { NextApiRequest, NextApiResponse } from 'next';
import { getPlaceCreatorBySlug } from '~/datalayer/places';

import { getCurrentUserId } from '~/utils/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<boolean | { message: string; }>,
) {
	const userId = await getCurrentUserId(req);

	if (!userId) {
		res.status(200).json(false);
	}

	const slug = req.query['slug'] as string;

	const placeCreator = await getPlaceCreatorBySlug(slug);

	if (!placeCreator) {
		res.status(404).json({ message: 'Place not found' });
		return;
	}

	res.status(200).json(placeCreator === userId);
}
