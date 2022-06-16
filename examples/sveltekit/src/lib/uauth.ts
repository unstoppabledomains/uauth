import type UAuth from '@uauth/js';

async function getUAuth(window: Window): Promise<UAuth> {
	return new (await import('@uauth/js')).default({
		clientID: import.meta.env.VITE_CLIENT_ID as string,
		redirectUri: import.meta.env.VITE_REDIRECT_URI as string,
		scope: 'openid wallet',
		window
	});
}

export default getUAuth;
