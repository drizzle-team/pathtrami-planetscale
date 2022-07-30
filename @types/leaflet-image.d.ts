declare module 'leaflet-image' {
	export default function leafletImage(
		map: L.Map,
		callback: (err: Error, canvas: HTMLCanvasElement) => void,
	): void;
}
