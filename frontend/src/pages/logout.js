import {useRouter} from "next/router";
import React, {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useContext(AuthContext)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          {/* Page header */}
          <div className="bg-white shadow">
            <div className="py-5 px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                Are you sure you want to logout?
              </h1>
            </div>
          </div>

          <div className="mt-8">
            <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
              <button className="bg-blue-500 hover:bg-blue6-600 text-white px-3 py-2 rounded" onClick={handleLogout}>logout</button>
            </div>
          </div>

          <footer className="mt-5">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
              <div className="border-t border-gray-200 py-8 text-sm text-gray-500 text-center sm:text-left">
                <span className="block sm:inline">&copy; {new Date().getFullYear()} The Independent Dev</span>{' '}
              </div>
            </div>
          </footer>
        </main>
      </div>
  )
}
