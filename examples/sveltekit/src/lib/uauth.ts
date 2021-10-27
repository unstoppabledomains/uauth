import type UAuth from '@uauth/js';

let uauth: UAuth;
async function getUAuth(): Promise<UAuth> {
	if (!uauth) {
		uauth = new (await import('@uauth/js')).default({
			clientID: import.meta.env.VITE_CLIENT_ID as string,
			clientSecret: import.meta.env.VITE_CLIENT_SECRET as string,
			redirectUri: import.meta.env.VITE_REDIRECT_URI as string,
			postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI as string,
			scope: 'openid wallet'
		});
	}

	return uauth;
}

export default getUAuth;
