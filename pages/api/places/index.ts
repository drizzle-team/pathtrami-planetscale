import { NextApiRequest, NextApiResponse } from 'next';
import { desc, eq } from 'drizzle-orm/expressions';

import { getConnection } from '~/utils/db';
import { placesImages } from '~/models/places_images';
import { places } from '~/models/places';
import { InferModel } from 'drizzle-orm-mysql';
import { SavePlaceRequest } from './[slug]';
import { imagesClient } from '~/utils/cloudflare';
import { getCurrentUserId } from '~/utils/auth';

export interface Place {
	slug: string;
	name: string;
	address: string;
	description: string;
	location: PlaceLocation;
	images: {
		id: string;
		url: string;
	}[];
	createdBy: string;
}

export interface PlaceLocation {
	lat: number;
	lng: number;
}

export async function mapPlaceResponse(
	place: Pick<
		InferModel<typeof places>,
		| 'slug'
		| 'name'
		| 'address'
		| 'description'
		| 'lat'
		| 'lng'
		| 'createdBy'
	>,
	images: Pick<InferModel<typeof placesImages>, 'id' | 'url'>[],
): Promise<Place> {
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
		createdBy: place.createdBy,
	};
}

export async function aggregatePlaces(
	rows: {
		places: Pick<
			InferModel<typeof places>,
			| 'slug'
			| 'name'
			| 'address'
			| 'description'
			| 'lat'
			| 'lng'
			| 'createdBy'
		>;
		placesImages: Pick<InferModel<typeof placesImages>, 'id' | 'url'>;
	}[],
): Promise<Place[]> {
	const result: Place[] = [];

	for (const { places: place, placesImages: image } of rows) {
		const item = result.find((item) => item.slug === place.slug);

		if (!item) {
			result.push(await mapPlaceResponse(place, image.id ? [image] : []));
		} else if (image.id) {
			item.images.push({
				id: image.id,
				url: image.url,
			});
		}
	}

	return result;
}

export type UploadUrlsResponse = {
	id: string;
	uploadURL: string;
	serveURL: string;
}[];

export async function createUploadUrls(
	filesCount: number,
): Promise<UploadUrlsResponse> {
	return await Promise.all(
		Array.from({ length: filesCount }, async () => {
			const { id, uploadURL } = await imagesClient
				.post<{ result: { id: string; uploadURL: string } }>(
					`/images/v2/direct_upload`,
				)
				.then(({ data }) => data.result);
			const serveURL = await imagesClient
				.get<{ result: { variants: [string] } }>(`/images/v1/${id}`)
				.then(({ data }) => data.result.variants[0]);

			return {
				id,
				uploadURL,
				serveURL,
			};
		}),
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
	const userId = await getCurrentUserId(req);
	if (!userId) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const db = await getConnection();

	const items: Place[] = await db.places
		.select()
		.leftJoin(placesImages, eq(placesImages.placeSlug, places.slug), {
			id: placesImages.id,
			url: placesImages.url,
		})
		.where(eq(places.createdBy, userId))
		.orderBy(desc(places.createdAt), desc(placesImages.createdAt))
		.execute()
		.then(aggregatePlaces);

	res.status(200).json(items);
}

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse<Place | { message: string }>,
) {
	const userId = await getCurrentUserId(req);
	if (!userId) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const db = await getConnection();
	const { name, address, description, location, images } =
		req.body as SavePlaceRequest<'new'>;

	const slug = Math.random().toString(36).substring(2);

	await db.places
		.insert({
			slug,
			name,
			address,
			description,
			lat: location.lat,
			lng: location.lng,
			createdBy: userId,
		})
		.execute();

	const place = await db.places
		.select()
		.where(eq(places.slug, slug))
		.limit(1)
		.execute()
		.then(([place]) => place!);

	let imagesToUpload: Pick<InferModel<typeof placesImages>, 'id' | 'url'>[] =
		[];

	if (images.length) {
		// Create upload URLs for each image and return them in the response

		const uploadUrls = await createUploadUrls(images.length);

		await db.placesImages
			.insert(
				uploadUrls.map(({ id, serveURL }) => ({
					id,
					placeSlug: slug,
					url: serveURL,
				})),
			)
			.execute();

		imagesToUpload = uploadUrls.map(({ id, uploadURL }) => ({
			id,
			url: uploadURL,
		}));
	}

	const result = await mapPlaceResponse(place, imagesToUpload);

	res.status(201).json(result);
}
