import { eq } from 'drizzle-orm/expressions';
import { NextApiRequest, NextApiResponse } from 'next';

import { places } from '~/models/places';
import { getCurrentUserId } from '~/utils/auth';
import { getConnection } from '~/utils/db';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<boolean | { message: string }>,
) {
	const userId = await getCurrentUserId(req);

	if (!userId) {
		res.status(200).json(false);
	}

	const slug = req.query['slug'] as string;

	const db = await getConnection();
	const place = await db.places
		.select({ createdBy: places.createdBy })
		.where(eq(places.slug, slug))
		.limit(1)
		.execute()
		.then(([place]) => place);

	if (!place) {
		res.status(404).json({ message: 'Place not found' });
		return;
	}

	res.status(200).json(place.createdBy === userId);
}
