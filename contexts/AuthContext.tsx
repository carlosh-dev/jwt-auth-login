import { createContext, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { api } from "../services/apiClient";
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

interface SigninCredentials {
  email: string;
  password: string;
}

interface User {
  email: string;
  permissions: string[];
  roles: string[];
}


interface AuthContextData {
  isAuthnticated: boolean;
  user: User;
  signIn: (credentials: SigninCredentials) => Promise<void>;
  signOut: () => void;
  broadcastAuth: MutableRefObject<BroadcastChannel>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, 'admin.token')
  destroyCookie(undefined, 'admin.refreshToken')
  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User>();
  const isAuthnticated = !!user;

  const broadcastAuth = useRef<BroadcastChannel>(null);

  useEffect(() => {
    broadcastAuth.current = new BroadcastChannel("auth");

    broadcastAuth.current.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;
        case "signIn":
          window.location.reload();
          break;
        default:
          break;
      }
    };
  }, [broadcastAuth]);

  useEffect(() => {
    const { 'admin.token': token } = parseCookies();

    if (token) {
      api.get('/me').then((response) => {
        const { email, permissions, roles } = response.data;
        setUser({
          email,
          permissions,
          roles
        })
      }).catch(() => {
        if (process.browser) {
          signOut()
        }
      })
    }
  }, [])

  async function signIn({ email, password }: SigninCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'admin.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/' // What path will have access to the cookie. In this case, all of them.
      })
      setCookie(undefined, 'admin.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles,
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthnticated, user, broadcastAuth }}>
      {children}
    </AuthContext.Provider>
  )
}