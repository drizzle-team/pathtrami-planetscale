import { NextApiRequest, NextApiResponse } from 'next';

import { MySqlUpdateSet } from 'drizzle-orm-mysql/queries';
import isEqual from 'lodash.isequal';
import {
	addImagesToPlace,
	deleteImageByPlaceSlug,
	deleteImagesByOldIdsBySlug,
	getImagesByOldIdsBySlug,
} from '~/datalayer/placeImages';
import { deletePlaceBySlug, getCoordinatesBySlug, updatePlaceByCreatorAndSlug } from '~/datalayer/places';
import { places } from '~/models/places';
import { getCurrentUserId } from '~/utils/auth';
import {
	buildPlaceImageKey,
	buildPlacePrefix,
	buildPlacePreviewKey,
	createUploadUrl,
	createUploadUrls,
	deleteObject,
	deleteObjectsWithPrefix,
} from '~/utils/s3';
import { PlaceLocation } from '..';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	switch (req.method) {
		case 'POST':
			return handlePost(req, res);
		case 'DELETE':
			return handleDelete(req, res);
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
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
	previewURL: string | null;
}

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse<UpdatePlaceResponse | { message: string; }>,
) {
	const userId = await getCurrentUserId(req);
	if (!userId) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const slug = req.query['slug'] as string;
	const { name, address, description, location, images } = req.body as SavePlaceRequest;

	const oldLocation = await getCoordinatesBySlug(slug);

	if (!oldLocation) {
		res.status(404).json({ message: 'Place not found' });
		return;
	}

	const fieldsToUpdate: MySqlUpdateSet<typeof places> = Object.fromEntries(
		Object.entries({
			name,
			address,
			description,
			lat: location.lat,
			lng: location.lng,
		}).filter(([, value]) => typeof value !== 'undefined'),
	);

	let previewURL: string | null = null;

	if (!isEqual(oldLocation, location)) {
		const previewImage = await createUploadUrl(buildPlacePreviewKey(slug));
		fieldsToUpdate.previewURL = previewImage.serveURL;
		previewURL = previewImage.uploadURL;
	}

	const affectedRows = await updatePlaceByCreatorAndSlug(userId, slug, fieldsToUpdate);

	if (affectedRows === 0) {
		res.status(404).json({ message: 'Place not found' });
		return;
	}

	const oldImages: OldImageData[] = [];
	const newImages: NewImageData[] = [];
	images.forEach((img) => {
		if (img.new) {
			newImages.push(img);
		} else {
			oldImages.push(img);
		}
	});

	const imagesToRemove = await getImagesByOldIdsBySlug(slug, oldImages.map(({ id }) => id));

	await Promise.all(
		imagesToRemove.map(async ({ id }) => {
			await deleteObject(buildPlaceImageKey(slug, id));
		}),
	);

	await deleteImagesByOldIdsBySlug(slug, oldImages.map(({ id }) => id));

	const imagesToUpload = await createUploadUrls(newImages.length, slug);

	if (imagesToUpload.length) {
		await addImagesToPlace(slug, imagesToUpload);
	}

	res.status(200).json({
		images: imagesToUpload.map(({ uploadURL }) => uploadURL),
		previewURL,
	});
}

async function handleDelete(
	req: NextApiRequest,
	res: NextApiResponse<{ message: string; }>,
) {
	const slug = req.query['slug'] as string;

	await Promise.all([
		deleteImageByPlaceSlug(slug),
		deletePlaceBySlug(slug),
		deleteObjectsWithPrefix(buildPlacePrefix(slug)),
	]);

	res.status(200).json({ message: 'Place deleted' });
}
