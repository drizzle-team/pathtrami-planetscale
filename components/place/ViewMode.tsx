import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC, memo, useMemo } from 'react';

import Link from 'next/link';
import { MapContainer, Root } from '~/pages/[slug]';
import { Place } from '~/pages/api/places';
import Button from '../Button';
import Header from '../Header';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface ViewModeProps {
	place: Place;
	setEditMode: () => void;
}

const ViewMode = memo<ViewModeProps>(
	({ place, setEditMode }: ViewModeProps) => {
		const description = useMemo(
			() =>
				place.description.split('\n').map((line) => {
					return <div key={line}>{line}</div>;
				}),
			[place.description],
		);

		return (
			<>
				<Header
					actions={
						<Button
							size='sm'
							icon={<FontAwesomeIcon icon={faPenToSquare} />}
							onClick={setEditMode}
						>
							Edit
						</Button>
					}
				/>
				<Root>
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
							<div className='image' key={image.id}>
								<Image
									src={image.url}
									alt={`Instructions ${i + 1}`}
									layout='fill'
								/>
							</div>
						))}
					</div>
				</Root>
			</>
		);
	},
);

ViewMode.displayName = 'ViewMode';

export default ViewMode;
