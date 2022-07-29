import { NextApiRequest, NextApiResponse } from 'next';
import { and, asc, eq, notInArray } from 'drizzle-orm/expressions';
import { InferModel } from 'drizzle-orm-mysql';

import { getConnection } from '~/utils/db';
import { places } from '~/models/places';
import { placesImages } from '~/models/places_images';
import { aggregatePlaces, PlaceLocation, createUploadUrls } from '..';
import { imagesClient } from '~/utils/cloudflare';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	switch (req.method) {
		case 'GET':
			return handleGet(req, res);
		case 'POST':
			return handlePost(req, res);
		case 'DELETE':
			return handleDelete(req, res);
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
			id: placesImages.id,
			url: placesImages.url,
		})
		.where(eq(places.slug, req.query['slug'] as string))
		.orderBy(asc(placesImages.index))
		.execute()
		.then(aggregatePlaces);

	if (!place) {
		res.status(404).json({ message: 'Place not found' });
		return;
	}

	res.status(200).json(place);
}

interface ImageDataBase {
	id: string;
}

export interface NewImageData extends ImageDataBase {
	new: true;
	file: string;
}

export interface OldImageData extends ImageDataBase {
	new?: false;
	file?: undefined;
}

export type ImageData = NewImageData | OldImageData;

export interface SavePlaceRequest<TKind extends 'new' | 'edit' = 'edit'> {
	location: PlaceLocation;
	name: string;
	address: string;
	description: string;
	images: TKind extends 'new' ? NewImageData[] : ImageData[];
}

export interface UpdatePlaceResponse {
	images: string[];
}

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse<UpdatePlaceResponse>,
) {
	const db = await getConnection();
	const slug = req.query['slug'] as string;
	const { name, address, description, location, images } =
		req.body as SavePlaceRequest;
	const fieldsToUpdate = Object.fromEntries(
		Object.entries({
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
		.where(eq(places.slug, slug))
		.execute();

	const oldImages: OldImageData[] = [];
	const newImages: NewImageData[] = [];
	images.forEach((img) => {
		if (img.new) {
			newImages.push(img);
		} else {
			oldImages.push(img);
		}
	});

	const where = and(
		eq(placesImages.placeSlug, slug),
		oldImages.length
			? notInArray(
					placesImages.id,
					oldImages.map(({ id }) => id),
			  )
			: undefined,
	);
	const imagesToRemove = await db.placesImages
		.select({ id: placesImages.id })
		.where(where)
		.execute();

	await Promise.all(
		imagesToRemove.map(async ({ id }) => {
			await imagesClient.delete(`/images/v1/${id}`);
		}),
	);

	await db.placesImages.delete().where(where).execute();

	const imagesToUpload = await createUploadUrls(newImages.length);

	const imagesToInsert: InferModel<typeof placesImages, 'insert'>[] =
		imagesToUpload.map((img) => ({
			id: img.id,
			placeSlug: slug,
			url: img.serveURL,
		}));

	if (imagesToInsert.length) {
		await db.placesImages.insert(imagesToInsert).execute();
	}

	res.status(200).json({
		images: imagesToUpload.map(({ uploadURL }) => uploadURL),
	});
}

async function handleDelete(
	req: NextApiRequest,
	res: NextApiResponse<{ message: string }>,
) {
	const db = await getConnection();
	const slug = req.query['slug'] as string;

	await db.placesImages
		.delete()
		.where(eq(placesImages.placeSlug, slug))
		.execute();

	await db.places.delete().where(eq(places.slug, slug)).execute();
	await db.placesImages
		.delete()
		.where(eq(placesImages.placeSlug, slug))
		.execute();

	res.status(200).json({ message: 'Place deleted' });
}