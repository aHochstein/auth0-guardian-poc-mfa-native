import { createContext } from 'react';

export const AuthenticationContext = createContext({ authState: {username: null,signedIn:false, accessToken: null}, setAuthState: () => {}, auth0Client: null }); 