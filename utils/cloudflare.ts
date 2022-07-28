import axios from 'axios';

export const imagesClient = axios.create({
	baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}`,
	headers: {
		Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_API_TOKEN}`,
	},
});
