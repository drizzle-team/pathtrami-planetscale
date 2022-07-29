import L, { DragEndEventHandlerFn } from 'leaflet';
import Image from 'next/image';
import { FC, forwardRef, useEffect, useState } from 'react';
import { MapContainer as MapContainerDefault, Marker as LeafletMarker, TileLayer } from 'react-leaflet';

import { styled } from '@stitches/react';
import { PlaceLocation } from '~/pages/api/places';
import MarkerSvg from '~/public/marker.svg';
import { theme } from '~/stitches.config';

interface EditModeProps {
	mode: 'edit';
	static?: never;
	markerLocation?: PlaceLocation | undefined;
	setMarkerLocation: (location: PlaceLocation) => void;
}

interface ViewModeProps {
	mode: 'view';
	static?: boolean;
	markerLocation: PlaceLocation;
	setMarkerLocation?: undefined;
}

type Props = (EditModeProps | ViewModeProps) & {
	mapRef?: (map: L.Map) => void;
};

const Map: FC<Props> = ({ mapRef, ...props }) => {
	const [map, setMap] = useState<L.Map>();
	const setMapRef = (map: L.Map) => {
		setMap(map);
		mapRef?.(map);
	};

	const { setMarkerLocation } = props;

	useEffect(() => {
		if (!map) {
			return;
		}

		const handleLocationFound = (e: L.LocationEvent) => {
			setMarkerLocation?.(e.latlng);
		};

		map.on('locationfound', handleLocationFound);

		return () => {
			map.off('locationfound', handleLocationFound);
		};
	}, [map, setMarkerLocation]);

	useEffect(() => {
		if (map) {
			setMarkerLocation?.(map.getCenter());
		}
	}, [map, setMarkerLocation]);

	useEffect(() => {
		if (props.markerLocation) {
			map?.panTo(props.markerLocation);
		}
	}, [map, props.markerLocation]);

	useEffect(() => {
		if (!map || props.mode !== 'view') {
			return;
		}

		if (props.static) {
			map.removeControl(map.zoomControl);
			map.dragging.disable();
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.scrollWheelZoom.disable();
			map.boxZoom.disable();
			map.keyboard.disable();
			if (map.tap) map.tap.disable();
		} else {
			map.addControl(map.zoomControl);
			map.dragging.enable();
			map.touchZoom.enable();
			map.doubleClickZoom.enable();
			map.scrollWheelZoom.enable();
			map.boxZoom.enable();
			map.keyboard.enable();
			if (map.tap) map.tap.enable();
		}
	}, [props.mode, map, props.static]);

	useEffect(() => {
		if (!map || props.mode !== 'edit') {
			return;
		}

		const onDragEnd: DragEndEventHandlerFn = (e) => {
			props.setMarkerLocation(map.getCenter());
		};

		map.on('dragend', onDragEnd);

		return () => {
			map.off('dragend', onDragEnd);
		};
	}, [map, props, props.setMarkerLocation]);

	return (
		<Root>
			<MapContainer
				ref={setMapRef}
				center={props.markerLocation}
				zoom={17}
				static={props.static ?? false}
				attributionControl={false}
			>
				<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
				{props.mode === 'view' && (
					<LeafletMarker
						position={props.markerLocation}
						icon={MarkerIcon}
					/>
				)}
			</MapContainer>
			{props.mode === 'edit' && (
				<Marker>
					<Image
						src={MarkerSvg.src}
						width={MarkerSvg.width / 2}
						height={MarkerSvg.height / 2}
						alt='marker'
					/>
				</Marker>
			)}
		</Root>
	);
};

export default Map;

const MarkerIcon = new L.Icon({
	iconUrl: MarkerSvg.src,
	iconSize: [MarkerSvg.width / 2, MarkerSvg.height / 2],
	iconAnchor: [24, 28],
});

const Root = styled('div', {
	position: 'relative',
	height: '100%',
});

const MapContainer = styled(MapContainerDefault, {
	width: '100%',
	height: '100%',
	cursor: 'default',

	variants: {
		static: {
			true: {
				pointerEvents: 'none',
			},
		},
	},
});

const Marker = styled('div', {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(calc(-50% - 8px), calc(-50% - 6px))',
	zIndex: 401,
	pointerEvents: 'none',
	userSelect: 'none',
	transition: `all 100ms`,

	'.leaflet-dragging &': {
		filter: 'drop-shadow(0 5px 3px rgba(0, 0, 0, .7))',
		transform: 'translate(calc(-50% - 8px), calc(-50% - 10px))',
	},
});
