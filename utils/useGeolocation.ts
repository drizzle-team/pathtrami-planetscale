import { useEffect, useState } from 'react';

type Data =
	| {
			status: 'loading';
	  }
	| {
			status: 'success';
			latitude: number;
			longitude: number;
	  }
	| {
			status: 'error';
			error: GeolocationPositionError;
	  };

export default function useGeolocation() {
	const [data, setData] = useState<Data>({ status: 'loading' });

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setData({
					status: 'success',
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
			},
			(error) => {
				setData({
					status: 'error',
					error,
				});
			},
			{
				enableHighAccuracy: true,
			},
		);
	}, []);

	return {
		data,
		isSupported: !!navigator.geolocation,
	} as const;
}
