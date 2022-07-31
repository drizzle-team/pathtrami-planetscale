import { useGoogleLogin } from '@react-oauth/google';
import axios, { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { ChangeEventHandler, FC, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast, ToastContainer } from 'react-toastify';
import { v4 as uuid } from 'uuid';

import 'react-toastify/dist/ReactToastify.css';

import { Credentials } from 'google-auth-library';
import Script from 'next/script';
import { MapRef } from '~/components/Map';
import { MapContainer, Root } from '~/pages/[...slug]';
import { Place, PlaceLocation } from '~/pages/api/places';
import { SavePlaceRequest, UpdatePlaceResponse } from '~/pages/api/places/[slug]';
import Plus from '~/public/plus_white.svg';
import X from '~/public/x.svg';
import { styled } from '~/stitches.config';
import { apiClient, isAuthenticated, setGoogleAuth } from '~/utils/apiClient';
import Button from '../Button';
import Header from '../Header';
import Input from '../Input';
import LocationSelection from './LocationSelection';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface Props {
	place?: Place;
	newPlace?: boolean;
	onSave: (slug: string) => void;
	onCancel: () => void;
	pathChunks: string[];
}

interface ImageDataBase {
	id: string;
	url: string;
}

interface NewImageData extends ImageDataBase {
	new: true;
	file: File;
}

interface OldImageData extends ImageDataBase {
	new?: false;
}

type ImageData = NewImageData | OldImageData;

interface PlaceFormData {
	location?: PlaceLocation | undefined;
	name: string;
	address: string;
	description: string;
	images: ImageData[];
}

type UploadImageFileConfig = Blob | {
	blob: Blob;
	options: {
		noCache?: boolean;
	};
};

async function uploadImages(uploadUrls: string[], files: UploadImageFileConfig[]) {
	await Promise.all(
		uploadUrls.map(async (url) => {
			const config = files.shift()!;
			let file = config instanceof Blob ? config : config.blob;
			const options = config instanceof Blob ? {} : config.options;

			await axios.put(url, file, {
				headers: {
					'Content-Type': file.type,
					...(options.noCache ? { 'Cache-Control': 'no-cache' } : {}),
				},
			});
		}),
	);
}

const EditMode: FC<Props> = ({
	place,
	onSave,
	onCancel,
	pathChunks,
}: Props) => {
	const queryClient = useQueryClient();
	const router = useRouter();

	const [deleteConfirmationActive, setDeleteConfirmationActive] = useState(false);
	const [fileInputKey, setFileInputKey] = useState(uuid());
	const [mapRef, setMapRef] = useState<MapRef | null>(null);

	const locationSelectionActive = pathChunks.slice(-1)[0] === 'location';

	const googleLoginMutation = useMutation(async (code: string) => {
		return apiClient.post<Credentials>('/auth/google', {
			code,
		}).then(({ data }) => data);
	}, {
		onSuccess: (data) => {
			setGoogleAuth(data);
			handleSubmit(form.values);
		},
	});

	const login = useGoogleLogin({
		flow: 'auth-code',
		onSuccess: (response) => {
			googleLoginMutation.mutate(response.code);
		},
		onError: console.error,
	});

	const savePlaceMutation = useMutation(
		async (formData: PlaceFormData) => {
			NProgress.start();

			let slug: string;

			const newImages = formData.images.filter(
				(image): image is NewImageData => !!image.new,
			);

			const location = formData.location ?? { lat: 0, lng: 0 };

			if (!place) {
				// Create new place

				const requestData: SavePlaceRequest<'new'> = {
					...formData,
					location,
					images: formData.images.map((image) => ({
						id: image.id,
						new: true,
						file: (image as NewImageData).file.name,
					})),
				};

				const place = await apiClient
					.post<Place, AxiosResponse<Place>, SavePlaceRequest<'new'>>('/places', requestData)
					.then(({ data }) => data);
				slug = place.slug;

				const preview = await mapRef!.getPreview(location);

				await uploadImages(
					[...place.images.map(({ url }) => url), place.previewURL],
					[...newImages.map(({ file }) => file), { blob: preview, options: { noCache: true } }],
				);
			} else {
				// Update existing place

				slug = place.slug;

				const requestData: SavePlaceRequest = {
					...formData,
					location,
					images: formData.images.map((image) =>
						image.new
							? {
								id: image.id,
								new: true,
								file: image.file.name,
							}
							: {
								id: image.id,
							}
					),
				};

				const response = await apiClient.post<
					UpdatePlaceResponse,
					AxiosResponse<UpdatePlaceResponse>,
					SavePlaceRequest
				>(`/places/${place.slug}`, requestData)
					.then(({ data }) => data);

				const images = response.images;
				const blobs: UploadImageFileConfig[] = newImages.map(({ file }) => file);

				if (response.previewURL) {
					const preview = await mapRef!.getPreview(location);

					images.push(response.previewURL);
					blobs.push({
						blob: preview,
						options: { noCache: true },
					});
				}

				await uploadImages(images, blobs);
			}

			return slug;
		},
		{
			onSuccess(slug) {
				queryClient.invalidateQueries('places');
				onSave(place?.slug ?? slug);
			},
			onError() {
				toast(
					<>
						Whoops, something went wrong :(<br /> Please try again!
					</>,
					{ type: 'error' },
				);
			},
			onSettled() {
				NProgress.done();
			},
		},
	);

	const deletePlaceMutation = useMutation(async (slug: string) => {
		await apiClient.delete(`/places/${slug}`);
		queryClient.invalidateQueries('places');
		router.push('/');
	});

	const handleSubmit = (formData: PlaceFormData) => {
		if (!isAuthenticated()) {
			login();
			return;
		}

		savePlaceMutation.mutate(formData);
	};

	const form = useFormik<PlaceFormData>({
		initialValues: {
			location: place?.location,
			name: place?.name ?? '',
			address: place?.address ?? '',
			description: place?.description ?? '',
			images: place?.images.map(({ id, url }) => ({
				id: String(id),
				url,
				type: 'old',
			})) ?? [],
		},
		onSubmit: handleSubmit,
	});

	const handleAddressChange = ({
		address,
		location,
	}: {
		address: string;
		location: PlaceLocation;
	}) => {
		router.back();
		form.setFieldValue('address', address);
		form.setFieldValue('location', location);
	};

	const handleDeleteButtonClick = () => {
		if (!place) {
			return;
		}

		if (!deleteConfirmationActive) {
			setDeleteConfirmationActive(true);
			return;
		}

		deletePlaceMutation.mutate(place.slug);
	};

	const handleImageSelect: ChangeEventHandler<HTMLInputElement> = (e) => {
		const { files } = e.target;
		const file = files?.[0];
		if (!file) {
			return;
		}

		setFileInputKey(uuid());

		// Create blob url for image
		const reader = new FileReader();
		reader.onload = () => {
			const imageUrl = reader.result as string;
			const newImage: NewImageData = {
				id: uuid(),
				url: imageUrl,
				new: true,
				file,
			};
			form.setFieldValue('images', [...form.values.images, newImage]);
		};
		reader.readAsDataURL(file);
	};

	const handleImageDelete = (id: string) => {
		form.setFieldValue('images', form.values.images.filter(({ id: imageId }) => imageId !== id));
	};

	return (
		<>
			<Script
				src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
			/>

			<Root hidden={locationSelectionActive}>
				<Header
					actions={
						<HeaderButtons>
							<Button
								variant='secondary'
								size='sm'
								onClick={onCancel}
								disabled={deletePlaceMutation.isLoading || savePlaceMutation.isLoading}
							>
								Cancel
							</Button>
							<Button
								variant='cta'
								size='sm'
								onClick={() => form.handleSubmit()}
								disabled={savePlaceMutation.isLoading}
							>
								{savePlaceMutation.isLoading ? 'Saving...' : 'Save'}
							</Button>
						</HeaderButtons>
					}
				/>
				<div className='content'>
					<MapContainer>
						<Link href={`${router.asPath}/location`} shallow>
							<a>
								<Map
									mapRef={setMapRef}
									mode='view'
									static
									markerLocation={form.values.location}
								/>
							</a>
						</Link>
						{
							/* {!savePlaceMutation.isLoading && (
							<Link href={`${router.asPath}/location`} shallow>
								<a>
									<EditMapButton size='sm'>
										Edit
									</EditMapButton>
								</a>
							</Link>
						)} */
						}
					</MapContainer>
					<div>
						<Input
							label='Name'
							name='name'
							value={form.values.name}
							onChange={form.handleChange}
							placeholder='My home'
							maxLength={50}
							disabled={savePlaceMutation.isLoading}
						/>
					</div>
					<div>
						<Input
							label='Address'
							name='address'
							value={form.values.address}
							onChange={form.handleChange}
							placeholder='123 Main St'
							maxLength={50}
							disabled={savePlaceMutation.isLoading}
						/>
					</div>
					<div>
						<Input
							multiline
							label='Description (optional)'
							name='description'
							value={form.values.description}
							onChange={form.handleChange}
							placeholder='Extra info and some instructions on how to get there'
							maxLength={500}
							disabled={savePlaceMutation.isLoading}
						/>
					</div>
					<div className='images'>
						{form.values.images.map((image, index) => (
							<div className='image' key={image.id}>
								<Image src={image.url} alt={`Instructions ${index + 1}`} layout='fill' />
								{!savePlaceMutation.isLoading && (
									<button className='remove' onClick={() => handleImageDelete(image.id)}>
										<Image src={X.src} width={X.width} height={X.height} alt='Remove' />
									</button>
								)}
							</div>
						))}
						{form.values.images.length < 4 && (
							<div className='image new'>
								<Image src={Plus.src} width={Plus.width} height={Plus.height} alt='Add image' />
								Add image
								<input key={fileInputKey} type='file' accept='image/png, image/jpeg' onChange={handleImageSelect} />
							</div>
						)}
					</div>
					{!!place && (
						<Button
							variant='secondary'
							onClick={handleDeleteButtonClick}
							disabled={deletePlaceMutation.isLoading || savePlaceMutation.isLoading}
							style={{ marginTop: 50 }}
						>
							{deletePlaceMutation.isLoading
								? 'Deleting...'
								: deleteConfirmationActive
								? 'Press again to confirm'
								: 'Delete place'}
						</Button>
					)}
				</div>
			</Root>

			{locationSelectionActive && (
				<LocationSelection
					address={form.values.address}
					location={form.values.location}
					onSave={handleAddressChange}
					onCancel={() => router.back()}
				/>
			)}

			<ToastContainer
				position='bottom-right'
				theme='dark'
				autoClose={3000}
				hideProgressBar
				newestOnTop
			/>
		</>
	);
};

export default EditMode;

const HeaderButtons = styled('div', {
	display: 'flex',
	flexFlow: 'row nowrap',
	gap: 6,

	'> *': {
		width: 90,
	},
});

const EditMapButton = styled(Button, {
	position: 'absolute',
	left: 6,
	top: 6,
	zIndex: 402,
	width: 68,
	boxShadow: '0 0 3px 1px #000',
});
