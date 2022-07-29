import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import { FC, FocusEventHandler, useEffect, useState } from 'react';

import { PlaceLocation } from '~/pages/api/places';
import { styled, theme } from '~/stitches.config';
import Button from '../Button';
import Input from '../Input';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface Props {
	address: string;
	location?: PlaceLocation;
	onSave: (data: { address: string; location: PlaceLocation; }) => void;
}

const LocationSelection: FC<Props> = (props) => {
	const [address, setAddress] = useState(props.address);
	const [location, setLocation] = useState(props.location);
	const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
	const [input, setInput] = useState<
		HTMLInputElement | HTMLTextAreaElement | null
	>(null);
	const [autocompleteMenu, setAutocompleteMenu] = useState<HTMLDivElement | null>(null);

	const handleInputFocus: FocusEventHandler = (e) => {
		setIsAutocompleteOpen(true);
	};

	const handleCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					console.error(error);
				},
				{ enableHighAccuracy: true },
			);
		}
	};

	const handleSave = () => {
		props.onSave({ address, location: location! });
	};

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

	return (
		<Root>
			<div className='address-container'>
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
			</div>
			{location && (
				<Map
					mode='edit'
					markerLocation={location}
					setMarkerLocation={setLocation}
				/>
			)}
			<Button variant='cta' onClick={handleSave}>
				Save Address
			</Button>
		</Root>
	);
};

export default LocationSelection;

const Root = styled('div', {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	background: theme.colors.bg,
	display: 'grid',
	gridTemplateColumns: '1fr',
	gridTemplateRows: 'min-content 441px min-content',
	gap: 20,
	zIndex: 402,
	padding: `47px ${theme.sizes.screenPadding} 20px`,

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
});
