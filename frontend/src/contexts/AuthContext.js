import React, {createContext, useEffect, useState} from "react";
import AuthService from "../services/AuthService";
import {useRouter} from "next/router";

const DefaultProps = {
  login: () => null,
  logout: () => null,
  register: () => null,
  user: null
};

export const AuthContext = createContext(DefaultProps);

export const AuthContextProvider = ({children, pageProps}) => {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(async () => {
    setLoading(true)
    try {
      await AuthService.refresh()
      await getUser()
    } catch (e) {
      setUser(null)
      setLoading(false)
      router.push('/login')
    } finally {
      setLoading(false)
    }

    setInterval(async () => {
      // Refresh token every 25 minutes
      try {
        console.log("Refreshing access token")
        await AuthService.refresh()
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

  async function register(username, password, re_password) {
    return await AuthService.register(username, password, re_password);
  }

  async function login(username, password) {
    await AuthService.login(username, password)
    await getUser()
  }

  async function logout() {
    setUser(null);
    return await AuthService.logout();
  }

  if (pageProps.protected && !user) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{user, login, logout, register, loading, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};
