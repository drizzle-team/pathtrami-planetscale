import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormik } from 'formik';
import { FC, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import axios from 'axios';

import { Place, PlaceLocation } from '~/pages/api/places';
import Button from '../Button';
import Header from '../Header';
import Input from '../Input';
import { MapContainer, Root } from '~/pages/[slug]';
import { styled } from '~/stitches.config';
import LocationSelection from './LocationSelection';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface EditModeProps {
	place?: Place;
	newPlace?: boolean;
	onSave: (slug: string) => void;
	onCancel: () => void;
}

interface PlaceFormData {
	location: PlaceLocation;
	name: string;
	address: string;
	description: string;
	images: string[];
}

const EditMode: FC<EditModeProps> = ({
	place,
	onSave,
	onCancel,
}: EditModeProps) => {
	const queryClient = useQueryClient();

	const [locationSelectionActive, setLocationSelectionActive] =
		useState(false);

	const savePlaceMutation = useMutation(
		async (formData: PlaceFormData) => {
			// Create new place
			if (!place) {
				return (await axios.post<Place>('/api/places', formData)).data;
			}

			// Update existing place
			return (
				await axios.post<Place>(`/api/places/${place.slug}`, formData)
			).data;
		},
		{
			onSuccess(data) {
				queryClient.invalidateQueries('places');
				onSave(place?.slug ?? data!.slug);
			},
		},
	);

	const handleSubmit = (formData: PlaceFormData) => {
		savePlaceMutation.mutate(formData);
	};

	const formik = useFormik<PlaceFormData>({
		initialValues: {
			location: place?.location ?? { lat: 0, lng: 0 },
			name: place?.name ?? '',
			address: place?.address ?? '',
			description: place?.description ?? '',
			images: place?.images ?? [],
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
		setLocationSelectionActive(false);
		formik.setFieldValue('address', address);
		formik.setFieldValue('location', location);
	};

	return (
		<>
			<Header
				actions={
					<HeaderButtons>
						<Button
							variant='secondary'
							size='sm'
							onClick={onCancel}
						>
							Cancel
						</Button>
						<Button
							variant='cta'
							size='sm'
							onClick={() => formik.handleSubmit()}
							disabled={savePlaceMutation.isLoading}
						>
							{savePlaceMutation.isLoading ? 'Saving...' : 'Save'}
						</Button>
					</HeaderButtons>
				}
			/>
			<Root>
				<>
					<MapContainer>
						<Map
							mode='view'
							static
							markerLocation={formik.values.location}
						/>
						<EditMapButton
							size='sm'
							onClick={() => setLocationSelectionActive(true)}
						>
							Edit
						</EditMapButton>
					</MapContainer>
					<div>
						<Input
							label='Name'
							name='name'
							value={formik.values.name}
							onChange={formik.handleChange}
							placeholder='My home'
						/>
					</div>
					<div>
						<Input
							label='Address'
							name='address'
							value={formik.values.address}
							onChange={formik.handleChange}
							placeholder='123 Main St'
						/>
					</div>
					<div>
						<Input
							multiline
							label='Description (optional)'
							name='description'
							value={formik.values.description}
							onChange={formik.handleChange}
							placeholder='Some instructions on how to get there'
						/>
					</div>
					<div className='images'>
						{formik.values.images.map((image, index) => (
							<div className='image' key={index}>
								<Image
									src={image}
									alt={`Instructions ${index + 1}`}
									layout='fill'
								/>
								<div className='remove'>
									<FontAwesomeIcon icon={faTimes} size='lg' />
								</div>
							</div>
						))}
					</div>
				</>
			</Root>

			{locationSelectionActive && (
				<LocationSelection
					address={formik.values.address}
					location={formik.values.location}
					onSave={handleAddressChange}
				/>
			)}
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
});
