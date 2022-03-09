import React, {createContext, useEffect, useState} from "react";
import AuthService from "../services/AuthService";
import {useRouter} from "next/router";

const DefaultProps = {
  login: () => null,
  logout: () => null,
  register: () => null,
  user: null,
  setUser: () => null,
  accessToken: null,
  setAccessToken: () => null
};

export const AuthContext = createContext(DefaultProps);

export const AuthContextProvider = ({children, pageProps}) => {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const router = useRouter();

  useEffect(async () => {
    setLoading(true)
    try {
      const tokenRes = await AuthService.refresh()
      setAccessToken(tokenRes.data.accessToken)
      await getUser()
    } catch (e) {
      setUser(null)
      setLoading(false)
      if (router.route !== "/login" &&
        router.route !== "/register" &&
        router.route !== "/accounts/confirm-email/[key]" &&
        router.route !== "/accounts/reset-password" &&
        router.route !== "/accounts/reset-password/confirm/[token]"
      ) {
        await router.push('/login')
      }
    } finally {
      setLoading(false)
    }

    setInterval(async () => {
      // Refresh token every 25 minutes
      try {
        console.log("Refreshing access token")
        const tokenRes = await AuthService.refresh()
        setAccessToken(tokenRes.data.accessToken)
      } catch (e) {
        console.log(e)
      }
    }, 25 * 60 * 1000)
  }, [])

  async function getUser() {
    try {
      const res = await AuthService.getCurrentUser()
      setUser(res.data.user)
    } catch (e) {
      setUser(null)
    }
  }

  async function register(username, email, password1, password2, first_name, last_name) {
    try {
      const res = await AuthService.register(username, email, password1, password2, first_name, last_name);
      return await res.json()
    } catch (e) {
      console.log(e)
    }
  }

  async function login(username, password) {
    try {
      const res = await AuthService.login(username, password)
      if (res.status === 200) {
        const data = await res.json()
        setAccessToken(data.accessToken)
        await getUser()
        return data
      }
      return await res.json()
    } catch (e) {
      console.log(e)
    }
  }

  async function logout() {
    setUser(null);
    return await AuthService.logout();
  }

  if (pageProps.protected && !user) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{user, login, logout, register, loading, setUser, accessToken, setAccessToken}}>
      {children}
    </AuthContext.Provider>
  );
};
