import L, { DragEndEventHandlerFn } from 'leaflet';
import leafletImage from 'leaflet-image';
import Image from 'next/image';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { MapContainer as MapContainerDefault, Marker as LeafletMarker, TileLayer } from 'react-leaflet';

import { styled } from '@stitches/react';
import { PlaceLocation } from '~/pages/api/places';
import MarkerSvg from '~/public/marker_old.svg';
import { theme } from '~/stitches.config';

interface BaseProps {
	markerLocation?: PlaceLocation | undefined;
	noLocationText?: ReactNode;
	removeMapOnMissingLocation?: boolean;
}

interface EditModeProps extends BaseProps {
	mode: 'edit';
	static?: never;
	setMarkerLocation: (location: PlaceLocation) => void;
}

interface ViewModeProps extends BaseProps {
	mode: 'view';
	static?: boolean;
	setMarkerLocation?: undefined;
}

export interface MapRef {
	map: L.Map;
	getPreview: typeof getPreview;
}

type Props = (EditModeProps | ViewModeProps) & {
	mapRef?: (ref: MapRef | null) => void;
};

const Map: FC<Props> = ({ mapRef, ...props }) => {
	const [map, setMapRaw] = useState<L.Map | null>();
	const setMapRef = useCallback((map: L.Map | null) => {
		setMapRaw(map);
		if (!map) {
			mapRef?.(null);
		} else {
			mapRef?.({ map, getPreview });
		}
	}, [mapRef]);

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

	// useEffect(() => {
	// 	if (map) {
	// 		setMarkerLocation?.(map.getCenter());
	// 	}
	// }, [map, setMarkerLocation]);

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
			<MapContainerWrapper noLocation={!props.markerLocation}>
				{(props.markerLocation || !props.removeMapOnMissingLocation) && (
					<MapContainer
						ref={setMapRef}
						center={props.markerLocation ?? [0, 0]}
						zoom={17}
						static={props.static ?? false}
						attributionControl={false}
					>
						<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
						{props.mode === 'view' && (
							<LeafletMarker
								position={props.markerLocation ?? [0, 0]}
								icon={MarkerIcon}
							/>
						)}
					</MapContainer>
				)}
				{props.mode === 'edit' && (
					<Marker>
						<Image
							src={MarkerSvg.src}
							width={MarkerSvg.width / 2}
							height={MarkerSvg.height / 2}
							alt='Marker'
						/>
					</Marker>
				)}
			</MapContainerWrapper>

			{!props.markerLocation && (
				<div className='location-missing'>
					<Image src={MarkerSvg.src} width={MarkerSvg.width / 2} height={MarkerSvg.height / 2} alt='Marker' />
					<div className='text'>
						{props.noLocationText ?? 'Tap to select location'}
					</div>
				</div>
			)}
		</Root>
	);
};

Map.displayName = 'Map';

export default Map;

const MarkerIcon = new L.Icon({
	iconUrl: MarkerSvg.src,
	iconSize: [MarkerSvg.width / 2, MarkerSvg.height / 2],
	iconAnchor: [12, 30],
});

export const MarkerIconStatic = new L.Icon({
	iconUrl: MarkerSvg.src,
	iconSize: [MarkerSvg.width / 2, MarkerSvg.height / 2],
	iconAnchor: [19, 30],
});

const Root = styled('div', {
	position: 'relative',
	height: '100%',

	'.location-missing': {
		position: 'absolute',
		left: '50%',
		top: '50%',
		transform: 'translate(-50%, -50%)',
		width: '100%',
		height: '100%',
		color: theme.colors.inputLabel,
		display: 'flex',
		flexFlow: 'column nowrap',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		backgroundColor: theme.colors.bgDarkAlt,
		// border: `1px dashed ${theme.colors.text}`,
		textAlign: 'center',
		padding: '0 10px',

		'.text': {
			color: theme.colors.text,
		},
	},
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

const MapContainerWrapper = styled('div', {
	width: '100%',
	height: '100%',

	variants: {
		noLocation: {
			true: {
				visibility: 'hidden',
				pointerEvents: 'none',
			},
		},
	},
});

const Marker = styled('div', {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(calc(-50% + 4px), calc(-50% - 9px))',
	zIndex: 401,
	pointerEvents: 'none',
	userSelect: 'none',
	transition: `all 100ms`,

	'.leaflet-dragging &': {
		filter: 'drop-shadow(0 5px 3px rgba(0, 0, 0, .7))',
		transform: 'translate(calc(-50% + 4px), calc(-50% - 12px))',
	},
});

export async function getPreview(location: PlaceLocation): Promise<Blob> {
	const container = document.createElement('div');
	const style: Partial<CSSStyleDeclaration> = {
		width: `${theme.sizes.mapPreviewWidth}`,
		height: `${theme.sizes.mapPreviewHeight}`,
		position: 'fixed',
		top: '0',
		left: '0',
		pointerEvents: 'none',
		zIndex: '-1',
		opacity: '0',
	};
	Object.assign(container.style, style);

	document.body.appendChild(container);

	const staticMap = L.map(container, {
		zoom: 17,
		preferCanvas: true,
		center: location,
		attributionControl: false,
		renderer: L.canvas(),
	});
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(staticMap);
	L.marker(location, { icon: MarkerIconStatic }).addTo(staticMap);

	return new Promise((resolve, reject) => {
		leafletImage(staticMap, (err, canvas) => {
			if (err) {
				reject(err);
				return;
			}

			canvas.toBlob((blob) => {
				document.body.removeChild(container);
				staticMap.remove();
				resolve(blob!);
			});
		});
	});
}
