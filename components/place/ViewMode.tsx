import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC, memo, useMemo, useState } from 'react';

import Link from 'next/link';
import { MapContainer, Root } from '~/pages/[slug]';
import { Place } from '~/pages/api/places';
import { styled } from '~/stitches.config';
import Button from '../Button';
import Header from '../Header';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface ViewModeProps {
	place: Place;
	editable: boolean;
	setEditMode: () => void;
}

const ViewMode = memo<ViewModeProps>(
	({ editable, place, setEditMode }: ViewModeProps) => {
		const [currentImage, setCurrentImage] = useState<number>();

		const description = useMemo(
			() =>
				place.description.split('\n').map((line) => {
					return <div key={line}>{line}</div>;
				}),
			[place.description],
		);

		return (
			<Root>
				<Header
					actions={editable && (
						<Button
							size='sm'
							icon={<FontAwesomeIcon icon={faPenToSquare} />}
							onClick={setEditMode}
						>
							Edit
						</Button>
					)}
				/>
				<div className='content'>
					<MapContainer>
						<Map mode='view' markerLocation={place.location} />
					</MapContainer>
					<div>
						<div>
							<b>{place.name}</b>
						</div>
						<div>{place.address}</div>
					</div>
					<div>{description}</div>
					<div className='buttons'>
						<Link
							href={`https://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=${place.location.lat},${place.location.lng}`}
						>
							<a target='_blank'>
								<Button>Open in Google Maps</Button>
							</a>
						</Link>
						<Link
							href={`https://waze.com/ul?ll=${place.location.lat},${place.location.lng}&navigate=yes`}
						>
							<a target='_blank'>
								<Button>Open in Waze</Button>
							</a>
						</Link>
					</div>
					<div className='images'>
						{place.images.map((image, i) => (
							<div className='image' key={image.id} onClick={() => setCurrentImage(i)}>
								<Image
									src={image.url}
									alt={`Instructions ${i + 1}`}
									layout='fill'
								/>
							</div>
						))}
					</div>
					{typeof currentImage !== 'undefined' && (
						<ImageOverlay onClick={() => setCurrentImage(undefined)}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={place.images[currentImage]!.url}
								alt={`Instructions ${currentImage + 1}`}
							/>
						</ImageOverlay>
					)}
				</div>
			</Root>
		);
	},
);

ViewMode.displayName = 'ViewMode';

export default ViewMode;

const ImageOverlay = styled('div', {
	position: 'fixed',
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,
	background: 'rgba(0, 0, 0, 0.9)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 1001,
	cursor: 'pointer',

	img: {
		maxWidth: '100%',
		maxHeight: '100%',
		position: 'relative',
	},
});
