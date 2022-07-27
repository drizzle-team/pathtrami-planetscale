import { NextApiRequest, NextApiResponse } from 'next';

import { aggregatePlaces, mapPlaceResponse, Place } from '.';
import { getConnection } from '~/utils/db';
import { and, desc, eq, inArray, notInArray } from 'drizzle-orm/expressions';
import { places } from '~/models/places';
import { placesImages } from '~/models/places_images';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Place | { message: string }>,
) {
	switch (req.method) {
		case 'GET':
			return handleGet(req, res);
		case 'POST':
			return handlePost(req, res);
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
	const db = await getConnection();
	const [place] = await db.places
		.select()
		.leftJoin(placesImages, eq(places.slug, placesImages.placeSlug), {
			url: placesImages.url,
		})
		.where(eq(places.slug, req.query['slug'] as string))
		.orderBy(desc(placesImages.createdAt))
		.execute()
		.then(aggregatePlaces);

	if (!place) {
		res.status(404).json({ message: 'Place not found' });
		return;
	}

	res.status(200).json(place);
}

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse<{ message: string }>,
) {
	const db = await getConnection();
	const oldSlug = req.query['slug'] as string;
	const { slug, name, address, description, location, images } = req.body;
	const fieldsToUpdate = Object.fromEntries(
		Object.entries({
			slug,
			name,
			address,
			description,
			lat: location.lat,
			lng: location.lng,
		}).filter(([, value]) => typeof value !== 'undefined'),
	);

	await db.places
		.update()
		.set(fieldsToUpdate)
		.where(eq(places.slug, oldSlug))
		.execute();

	const oldImages = await db.placesImages
		.select({ url: placesImages.url })
		.where(
			and(
				eq(placesImages.placeSlug, oldSlug),
				images.length
					? notInArray(placesImages.url, images)
					: undefined,
			),
		)
		.execute();

	if (oldImages.length) {
		await db.placesImages
			.delete()
			.where(
				inArray(
					placesImages.url,
					oldImages.map(({ url }) => url),
				),
			)
			.execute();
	}

	const imagesToInsert = images
		.filter((url: string) => !oldImages.find((image) => image.url === url))
		.map((url: string) => ({
			placeSlug: slug,
			url,
		}));

	if (images.length) {
		await db.placesImages.insert(imagesToInsert).execute();
	}

	res.status(201).json({ message: 'Place updated' });
}
