import { InferModel } from 'drizzle-orm-mysql';
import { MySqlUpdateSet } from 'drizzle-orm-mysql/queries';
import { and, asc, desc, eq } from 'drizzle-orm/expressions';
import { places } from '~/models/places';
import { placesImages } from '~/models/places_images';
import { getConnection } from '~/utils/db';

export type DbPlace = InferModel<typeof places>;
export type DbPlaceImage = InferModel<typeof placesImages>;

export type DbPlaceToImage = {
	places: DbPlace;
	placesImages: Pick<DbPlaceImage, 'id' | 'url'>;
};

/**
 * SELECT created_by FROM places WHERE slug = $1 LIMIT 1;
 */
export async function getPlaceCreatorBySlug(slug: string): Promise<string | undefined> {
	const db = await getConnection();

	const [place] = await db.places
		.select({ createdBy: places.createdBy })
		.where(eq(places.slug, slug))
		.limit(1)
		.execute();

	return place?.createdBy;
}

/**
 * SELECT slug, name, address, description, lat, lng,
 * 		  places.created_at, created_by, preview_url, places_images.id, places_images.url FROM places
 * LEFT JOIN places_images ON places_images.place_slug = places.slug
 * WHERE places.created_by = $1
 * ORDER BY places.created_at DESC, places_images.created_at DESC;
 */
export async function getUserPlacesWithImages(userId: string): Promise<DbPlaceToImage[]> {
	const db = await getConnection();

	const items = await db.places
		.select()
		.leftJoin(placesImages, eq(placesImages.placeSlug, places.slug), {
			id: placesImages.id,
			url: placesImages.url,
		})
		.where(eq(places.createdBy, userId))
		.orderBy(desc(places.createdAt), desc(placesImages.createdAt))
		.execute();

	return items;
}

/**
 * INSERT INTO places (slug, name, address, description, lat, lng, created_at, created_by, preview_url)
 * VALUES ($1, $2, ...), ($3, $4, ...);
 */
export async function createPlace(place: InferModel<typeof places, 'insert'>) {
	const db = await getConnection();
	await db.places.insert(place).execute();
}

/**
 * SELECT * FROM places WHERE slug = $1 LIMIT 1;
 */
export async function getOnePlaceBySlug(slug: string) {
	const db = await getConnection();
	const [place] = await db.places
		.select()
		.where(eq(places.slug, slug))
		.limit(1)
		.execute();

	return place;
}

/**
 * SELECT lat, lng FROM places WHERE slug = $1 LIMIT 1;
 */
export async function getCoordinatesBySlug(slug: string) {
	const db = await getConnection();

	const [oldLocation] = await db.places
		.select({
			lat: places.lat,
			lng: places.lng,
		})
		.where(eq(places.slug, slug))
		.limit(1)
		.execute();

	return oldLocation;
}

/**
 * @example
 * fieldsToUpdate = { description: 'newDescription' }
 *
 * UPDATE places SET description = 'newDescription' WHERE (created_by = $1 and slug = $2);
 */
export async function updatePlaceByCreatorAndSlug(
	creator: string,
	slug: string,
	fieldsToUpdate: MySqlUpdateSet<typeof places>,
): Promise<number> {
	const db = await getConnection();

	const [{ affectedRows }] = await db.places
		.update()
		.set(fieldsToUpdate)
		.where(and(eq(places.createdBy, creator), eq(places.slug, slug)))
		.execute();

	return affectedRows;
}

/**
 * DELETE FROM places WHERE slug = $1;
 */
export async function deletePlaceBySlug(slug: string) {
	const db = await getConnection();

	await db.places.delete().where(eq(places.slug, slug)).execute();
}

/**
 * SELECT slug, name, address, description, lat, lng,
 * 		  places.created_at, created_by, preview_url, places_images.id, places_images.url FROM places
 * LEFT JOIN places_images ON places_images.place_slug = places.slug
 * WHERE places.slug = $1
 * ORDER BY places.slug ASC;
 */
export async function getPlaceWithImagesBySlug(slug: string): Promise<DbPlaceToImage[]> {
	const db = await getConnection();
	return await db.places
		.select()
		.leftJoin(placesImages, eq(places.slug, placesImages.placeSlug), {
			id: placesImages.id,
			url: placesImages.url,
		})
		.where(eq(places.slug, slug))
		.orderBy(asc(placesImages.index))
		.execute();
}
