import {
	DeleteObjectCommand,
	paginateListObjectsV2,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const S3 = new S3Client({
	credentials: {
		accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
	},
	region: process.env.CUSTOM_AWS_REGION,
});

export type UploadImageResponse = {
	uploadURL: string;
	serveURL: string;
};

export type UploadUserImageResponse = UploadImageResponse & {
	id: string;
};

export async function createUploadUrl(
	key: string,
): Promise<UploadImageResponse> {
	const uploadURL = await getSignedUrl(
		S3,
		new PutObjectCommand({
			Bucket: process.env.IMAGES_BUCKET_NAME,
			Key: key,
			ACL: 'public-read',
		}),
	);
	const serveURL = `https://${process.env.IMAGES_BUCKET_NAME}.s3.amazonaws.com/${key}`;

	return { uploadURL, serveURL };
}

export function buildPlacePrefix(slug: string): string {
	return `places/${slug}`;
}

export function buildPlaceImageKey(imageId: string, slug: string): string {
	return `${buildPlacePrefix(slug)}/images/${imageId}`;
}

export function buildPlacePreviewKey(slug: string): string {
	return `${buildPlacePrefix(slug)}/preview`;
}

export async function createUploadUrls(
	filesCount: number,
	slug: string,
): Promise<UploadUserImageResponse[]> {
	return Promise.all(
		Array.from({ length: filesCount }, async () => {
			const id = uuid();
			const { serveURL, uploadURL } = await createUploadUrl(
				buildPlaceImageKey(id, slug),
			);
			return { id, serveURL, uploadURL };
		}),
	);
}

export async function deleteObject(key: string) {
	await S3.send(
		new DeleteObjectCommand({
			Bucket: process.env.IMAGES_BUCKET_NAME,
			Key: key,
		}),
	);
}

export async function deleteImage(id: string, slug: string) {
	await deleteObject(buildPlaceImageKey(id, slug));
}

export async function deleteObjectsWithPrefix(prefix: string) {
	const paginator = paginateListObjectsV2(
		{ client: S3 },
		{
			Bucket: process.env.IMAGES_BUCKET_NAME,
			Prefix: prefix,
		},
	);

	for await (const { Contents } of paginator) {
		await Promise.all(Contents!.map(({ Key }) => deleteObject(Key!)));
	}
}
