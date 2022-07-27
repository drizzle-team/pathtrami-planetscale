import { NextPage } from 'next';
import { useRouter } from 'next/router';

import EditMode from '~/components/place/EditMode';

const New: NextPage = () => {
	const router = useRouter();

	const handleCancel = () => {
		router.push('/');
	};

	const handleSave = (slug: string) => {
		router.replace(`/${slug}`);
	};

	return <EditMode onCancel={handleCancel} onSave={handleSave} />;
};

export default New;
