import React from "react";
import {MentorProfileNavbar} from "./MentorProfileNavbar";
import {UserProfileNavbar} from "./UserProfileNavbar";

export function DashboardLayout({ children, client }) {
  return (
    <>
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          {/* Page header */}
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
              <div className="py-6 md:flex md:items-center md:justify-between">
                {client ? (
                  <UserProfileNavbar />
                ) : (
                  <MentorProfileNavbar />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>

          <footer className="mt-5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
              <div className="border-t border-gray-200 py-8 text-sm text-gray-500 text-center sm:text-left">
                <span className="block sm:inline">&copy; {new Date().getFullYear()} The Independent Dev</span>{' '}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}
