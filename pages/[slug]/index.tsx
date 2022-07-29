import axios from 'axios';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQuery } from 'react-query';

import EditMode from '~/components/place/EditMode';
import ViewMode from '~/components/place/ViewMode';
import { styled, theme } from '~/stitches.config';
import { apiClient } from '~/utils/apiClient';
import { Place } from '../api/places';
import { getPlace } from '../api/places/[slug]';

interface Props {
	place: Place;
}

const LocationPage: NextPage<Props> = ({ place }) => {
	const router = useRouter();

	const [mode, setMode] = useState<'view' | 'edit'>('view');
	const [editable, setEditable] = useState(false);

	useQuery(
		['places', router.query['slug'], 'editable'],
		async () => {
			return apiClient.get<boolean>(
				`/places/${place.slug}/editable`,
			).then(({ data }) => data);
		},
		{
			onSuccess: (editable) => {
				setEditable(editable);
			},
		},
	);

	const handlePlaceUpdated = () => {
		router.replace(router.asPath);
		setMode('view');
	};

	if (mode === 'view') {
		return (
			<ViewMode
				place={place}
				editable={editable}
				setEditMode={() => setMode('edit')}
			/>
		);
	}

	return (
		<EditMode
			place={place}
			onSave={handlePlaceUpdated}
			onCancel={() => setMode('view')}
		/>
	);
};

export default LocationPage;

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
	const place = await getPlace(query['slug'] as string);

	if (!place) {
		res.statusCode = 302;
		res.setHeader('Location', '/');
		res.end();
		return { props: {} };
	}

	return {
		props: {
			place,
		},
	};
};

export const Root = styled('div', {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',

	variants: {
		hidden: {
			true: {
				display: 'none',
			},
		},
	},

	'.buttons': {
		display: 'flex',
		flexFlow: 'column nowrap',
		gap: 10,

		button: {
			width: '100%',
		},
	},

	'.content': {
		flex: '1',
		overflowY: 'auto',
		paddingBottom: 50,
		display: 'flex',
		flexFlow: 'column nowrap',
		gap: 15,

		'> *': {
			flex: '0 0 auto',
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
