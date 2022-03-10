import React, {useContext} from "react";
import Link from "next/link";
import {CashIcon, TableIcon, UserIcon} from "@heroicons/react/solid";
import {AuthContext} from "../contexts/AuthContext";
import { ChevronRightIcon } from '@heroicons/react/solid'
import {useRouter} from "next/router";
import {getProfilePicture} from "../utils/profilePic";


function UserProfileBreadcrumbs() {
  const router = useRouter()

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {router.route !== '/profile/u' ? (
          <li>
            <div>
              <Link href={"/profile/u"}>
                <a className="text-gray-400 hover:text-gray-500">
                  <UserIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Profile</span>
                </a>
              </Link>
            </div>
          </li>
        ) : (
          <Link href={router.route}>
            <a
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
              aria-current={'page'}
            >
              User Profile
            </a>
          </Link>
        )}
        <li>
          <div className="flex items-center">
            {router.route !== '/profile/u' && (
              <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
            <Link href={router.route}>
              <a
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={'page'}
              >
                {
                  router.route === '/profile/u/billing' && "Billing"
                }
                {
                  router.route === '/profile/u/session-history' && "Session History"
                }
              </a>
            </Link>
          </div>
        </li>
      </ol>
    </nav>
  )
}


export function UserProfileNavbar() {
  const {user} = useContext(AuthContext)

  return (
    <>
      <div className="flex-1 min-w-0">
        {/* Profile */}
        <div className="flex items-center">
          <img
            className="hidden h-16 w-16 rounded-full sm:block"
            src={getProfilePicture(user.profile_picture, user.name)}
            alt={user.username}
          />
          <div>
            <div className="flex items-center">
              <img
                className="h-16 w-16 rounded-full sm:hidden"
                src={getProfilePicture(user.profile_picture, user.name)}
                alt={user.username}
              />
              <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                {user.name}
              </h1>
            </div>
            <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
              <dt className="sr-only">Profile Navigation</dt>
              <dd
                className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0 capitalize">
                <UserProfileBreadcrumbs />
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">

        <span>
          <Link href={'/profile/u'}>
            <a
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true"/>
              Profile
            </a>
          </Link>
        </span>

        <span>
          <Link href={'/profile/u/session-history'}>
            <a
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <TableIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true"/>
              Session History
            </a>
          </Link>
        </span>

        <span>
          <Link href={'/profile/u/billing'}>
            <a
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CashIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true"/>
              Billing
            </a>
          </Link>
        </span>
      </div>
    </>
  )
}
