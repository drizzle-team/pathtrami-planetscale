import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';
import { FC, FocusEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { MapRef } from '~/components/Map';

import Image from 'next/image';
import { PlaceLocation } from '~/pages/api/places';
import Navigation from '~/public/navigation.svg';
import { styled, theme } from '~/stitches.config';
import Button from '../Button';
import Input from '../Input';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface Props {
	address: string;
	location?: PlaceLocation | undefined;
	onSave: (data: { address: string; location: PlaceLocation; }) => void;
	onCancel: () => void;
}

const LocationSelection: FC<Props> = ({ onSave, onCancel, ...props }) => {
	const [address, setAddress] = useState(props.address);
	const [location, setLocation] = useState(props.location);
	const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
	const [input, setInput] = useState<
		HTMLInputElement | HTMLTextAreaElement | null
	>(null);
	const [autocompleteMenu, setAutocompleteMenu] = useState<HTMLDivElement | null>(null);
	const [mapRef, setMapRef] = useState<MapRef | null>(null);
	const [autocomplete, setAutocomplete] = useState<google.maps.places.AutocompleteService>();
	const [autocompleteResults, setAutocompleteResults] = useState<google.maps.places.AutocompletePrediction[]>([]);

	const handleInputFocus: FocusEventHandler = (e) => {
		setIsAutocompleteOpen(true);
	};

	const handleCurrentLocation = useCallback(() => {
		if (!mapRef) {
			return;
		}

		mapRef.map.locate({
			setView: true,
			maxZoom: 17,
			enableHighAccuracy: true,
		});
	}, [mapRef]);

	const handleSave = () => {
		onSave({ address, location: location! });
	};

	// const updateAutocomplete = useMemo(() =>
	// 	debounce((input: string) => {
	// 		if (!autocomplete) {
	// 			return;
	// 		}

	// 		autocomplete.getPlacePredictions(
	// 			{ input },
	// 			(predictions, status) => {
	// 				if (status === 'OK') {
	// 					setAutocompleteMenu(predictions);
	// 				}
	// 			},
	// 		);
	// 	}, 500), [autocomplete]);

	useEffect(() => {
		function handler(e: TouchEvent | MouseEvent) {
			if (
				e.target instanceof Node
				&& e.target !== autocompleteMenu
				&& e.target !== input
				&& !autocompleteMenu?.contains(e.target)
			) {
				setIsAutocompleteOpen(false);
				input?.blur();
			}
		}

		window.addEventListener('touchstart', handler);
		window.addEventListener('mousedown', handler);

		return () => {
			window.removeEventListener('touchstart', handler);
			window.removeEventListener('mousedown', handler);
		};
	});

	// useEffect(() => {
	// 	setAutocomplete(new google.maps.places.AutocompleteService());
	// }, [setAutocomplete]);

	useEffect(() => {
		if (!location) {
			handleCurrentLocation();
		}
	}, [location, handleCurrentLocation]);

	return (
		<Root>
			{
				/* <div className='address-container'>
				<Input
					ref={setInput}
					className='input'
					label='Choose address'
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					onFocus={handleInputFocus}
					readOnly
				/>
				<div
					ref={setAutocompleteMenu}
					className='autocomplete-menu'
					style={{
						display: isAutocompleteOpen ? 'block' : undefined,
					}}
				>
					<div className='item' onClick={handleCurrentLocation}>
						<FontAwesomeIcon icon={faLocationDot} /> Use current location
					</div>
				</div>
			</div> */
			}
			<div className='map-container'>
				<Map
					mapRef={setMapRef}
					mode='edit'
					markerLocation={location}
					setMarkerLocation={setLocation}
				/>
				<Button className='current-location-button' onClick={handleCurrentLocation}>
					<Image src={Navigation.src} width={Navigation.width} height={Navigation.height} alt='Navigation' />
				</Button>
			</div>
			<Button variant='cta' onClick={handleSave} style={{ marginTop: 20 }}>
				Save Address
			</Button>
			<Button variant='secondary' onClick={onCancel} style={{ marginTop: 10 }}>
				Cancel
			</Button>
		</Root>
	);
};

export default LocationSelection;

const Root = styled('div', {
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	zIndex: 402,
	padding: `${theme.sizes.screenPadding} 0`,

	'.address-container': {
		position: 'relative',

		'.autocomplete-menu': {
			position: 'absolute',
			left: 0,
			bottom: 0,
			transform: 'translateY(100%)',
			width: '100%',
			background: ' #27292B',
			zIndex: 1001,
			display: 'none',
			overflow: 'hidden',
			borderRadius: `0 0 ${theme.sizes.borderRadius} ${theme.sizes.borderRadius}`,

			'.item': {
				height: 44,
				paddingLeft: 29,
				display: 'flex',
				alignItems: 'center',
				gap: 10,

				'&:not(:last-child)': {
					borderBottom: `1px solid ${theme.colors.inputBorder}`,
				},
			},
		},
	},

	'.map-container': {
		flex: 1,
		// marginTop: 20,
		position: 'relative',

		'.current-location-button': {
			position: 'absolute',
			right: 20,
			bottom: 20,
			zIndex: 1001,
			borderRadius: '50%',
			width: 48,
			height: 48,
			boxShadow: '0 0 5px 1px #000',
		},
	},
});
