import { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';

import { styled, theme } from '~/stitches.config';
import { Place } from '../api/places';
import ViewMode from '~/components/place/ViewMode';
import EditMode from '~/components/place/EditMode';

const LocationPage: NextPage = () => {
	const router = useRouter();

	const [mode, setMode] = useState<'view' | 'edit'>('view');

	const placeQuery = useQuery(
		['places', router.query['slug']],
		async () => {
			const { data } = await axios.get<Place>(
				`/api/places/${router.query['slug']}`,
			);
			return data;
		},
		{ enabled: router.query['slug'] !== undefined },
	);

	const handlePlaceUpdated = () => {
		setMode('view');
	};

	if (!placeQuery.data) {
		return null;
	}

	if (mode === 'view') {
		return (
			<ViewMode
				place={placeQuery.data}
				setEditMode={() => setMode('edit')}
			/>
		);
	}

	return (
		<EditMode
			place={placeQuery.data}
			onSave={handlePlaceUpdated}
			onCancel={() => setMode('view')}
		/>
	);
};

export default LocationPage;

export const Root = styled('div', {
	display: 'flex',
	flexFlow: 'column nowrap',
	gap: 15,

	'.buttons': {
		display: 'flex',
		flexFlow: 'column nowrap',
		gap: 10,

		button: {
			width: '100%',
		},
	},

	'.images': {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		gridAutoRows: '1fr',
		gap: 10,
		paddingBottom: 118,

		'.image': {
			borderRadius: theme.sizes.borderRadius,
			overflow: 'hidden',
			position: 'relative',
			height: 145,

			img: {
				objectFit: 'cover',
			},

			'.remove': {
				position: 'absolute',
				top: 4,
				right: 4,
				width: 28,
				height: 28,
				borderRadius: 2,
				background: theme.colors.bgAlt,
				cursor: 'pointer',
				color: '#000',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			},
		},
	},
});

export const MapContainer = styled('div', {
	height: theme.sizes.mapHeight,
	borderRadius: theme.sizes.borderRadius,
	overflow: 'hidden',
	position: 'relative',
});
