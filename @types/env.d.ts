declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				DATABASE_URL: string;
				NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				NEXT_PUBLIC_API_HOST: string;
				IMAGES_BUCKET_NAME: string;
				CUSTOM_AWS_ACCESS_KEY_ID: string;
				CUSTOM_AWS_SECRET_ACCESS_KEY: string;
				CUSTOM_AWS_REGION: string;
				NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
			}
		}
	}
}
