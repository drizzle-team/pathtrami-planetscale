import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import EditMode from '~/components/place/EditMode';
import ViewMode from '~/components/place/ViewMode';
import { styled, theme } from '~/stitches.config';
import { Place } from '../api/places';

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
	paddingBottom: 50,

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
		marginTop: 10,

		'.image': {
			borderRadius: theme.sizes.borderRadius,
			overflow: 'hidden',
			position: 'relative',
			height: 145,
			display: 'flex',
			flexFlow: 'column nowrap',
			alignItems: 'center',
			justifyContent: 'center',
			cursor: 'pointer',

			'&.new': {
				border: '1px dashed #FFF',
				userSelect: 'none',
				gap: 5,
				backgroundColor: theme.colors.bgDarkAlt,
				position: 'relative',

				input: {
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					opacity: 0,
					cursor: 'pointer',
				},
			},

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
				outline: 'none',
				border: 0,
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
