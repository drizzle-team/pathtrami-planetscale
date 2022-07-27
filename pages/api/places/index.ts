import { NextApiRequest, NextApiResponse } from 'next';
import { desc, eq } from 'drizzle-orm/expressions';

import { getConnection } from '~/utils/db';
import { placesImages } from '~/models/places_images';
import { places } from '~/models/places';
import { InferModel } from 'drizzle-orm-mysql';

export interface Place {
	slug: string;
	name: string;
	address: string;
	description: string;
	location: PlaceLocation;
	images: string[];
}

export interface PlaceLocation {
	lat: number;
	lng: number;
}

export function mapPlaceResponse(
	place: Pick<
		InferModel<typeof places>,
		'slug' | 'name' | 'address' | 'description' | 'lat' | 'lng'
	>,
	images: string[],
): Place {
	return {
		slug: place.slug,
		name: place.name,
		address: place.address,
		description: place.description,
		location: {
			lat: place.lat,
			lng: place.lng,
		},
		images,
	};
}

export function aggregatePlaces(
	rows: {
		places: Pick<
			InferModel<typeof places>,
			'slug' | 'name' | 'address' | 'description' | 'lat' | 'lng'
		>;
		placesImages: Pick<InferModel<typeof placesImages>, 'url'>;
	}[],
): Place[] {
	return rows.reduce<Place[]>(
		(acc, { places: place, placesImages: image }) => {
			const index = acc.findIndex((item) => item.slug === place.slug);

			if (index === -1) {
				acc.push(mapPlaceResponse(place, image.url ? [image.url] : []));
			} else if (image.url) {
				acc[index]!.images.push(image.url);
			}

			return acc;
		},
		[],
	);
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	switch (req.method) {
		case 'GET':
			await handleGet(req, res);
			break;
		case 'POST':
			await handlePost(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
}

async function handleGet(
	req: NextApiRequest,
	res: NextApiResponse<Place[] | { message: string }>,
) {
	const db = await getConnection();

	const items: Place[] = await db.places
		.select()
		.leftJoin(placesImages, eq(placesImages.placeSlug, places.slug), {
			url: placesImages.url,
		})
		.orderBy(desc(places.createdAt), desc(placesImages.createdAt))
		.execute()
		.then(aggregatePlaces);

	res.status(200).json(items);
}

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse<Place | { message: string }>,
) {
	const db = await getConnection();
	const { name, address, description, location, images } = req.body;

	const slug = Math.random().toString(36).substring(2);

	await db.places
		.insert({
			slug,
			name,
			address,
			description,
			lat: location.lat,
			lng: location.lng,
		})
		.execute();

	const place = await db.places
		.select()
		.where(eq(places.slug, slug))
		.limit(1)
		.execute()
		.then(([place]) => place!);

	if (images.length) {
		await db.placesImages
			.insert(
				images.map((url: string) => ({
					placeSlug: place.slug,
					url,
				})),
			)
			.execute();
	}

	const result = mapPlaceResponse(place, images);

	res.status(201).json(result);
}
