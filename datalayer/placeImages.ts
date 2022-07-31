import { and, eq, notInArray } from 'drizzle-orm/expressions';
import { placesImages } from '~/models/places_images';
import { getConnection } from '~/utils/db';
import { UploadUserImageResponse } from '~/utils/s3';
import { DbPlaceImage } from './places';

/**
 * INSERT INTO places_images (id, place_slug, url) VALUES ($1, $2, $3);
 */
export async function addImagesToPlace(slug: string, uploadUrls: UploadUserImageResponse[]) {
	const db = await getConnection();

	await db.placesImages
		.insert(
			uploadUrls.map(({ id, serveURL }) => ({
				id,
				placeSlug: slug,
				url: serveURL,
			})),
		)
		.execute();
}

/**
 * DELETE FROM places_images WHERE place_slug = $1;
 */
export async function deleteImageByPlaceSlug(slug: string) {
	const db = await getConnection();

	await db.placesImages
		.delete()
		.where(eq(placesImages.placeSlug, slug))
		.execute();
}

/**
 * SELECT id FROM places_images WHERE (place_slug = $1) and (id in ($2));
 */
export async function getImagesByOldIdsBySlug(slug: string, oldImages: string[]): Promise<Pick<DbPlaceImage, 'id'>[]> {
	const db = await getConnection();

	return await db.placesImages
		.select({ id: placesImages.id })
		.where(and(
			eq(placesImages.placeSlug, slug),
			oldImages.length
				? notInArray(
					placesImages.id,
					oldImages,
				)
				: undefined,
		))
		.execute();
}

/**
 * DELETE FROM places_images WHERE (place_slug = $1) and (id in ($2));
 */
export async function deleteImagesByOldIdsBySlug(slug: string, oldImages: string[]) {
	const db = await getConnection();

	await db.placesImages
		.delete()
		.where(and(
			eq(placesImages.placeSlug, slug),
			oldImages.length
				? notInArray(
					placesImages.id,
					oldImages,
				)
				: undefined,
		))
		.execute();
}
