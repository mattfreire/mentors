import React, {useContext} from "react";
import Link from "next/link";
import {CashIcon, ChartBarIcon, CheckCircleIcon, TableIcon} from "@heroicons/react/solid";
import {AuthContext} from "../contexts/AuthContext";
import useSWR from "swr";
import {API_URL} from "../config";
import {getProfilePicture} from "../utils/profilePic";

export function MentorProfileNavbar() {
  const {user, accessToken} = useContext(AuthContext)
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }
  const {data: mentor} = useSWR(`${API_URL}/api/mentors/me/`, fetcher)
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
                Welcome back, {user.name}
              </h1>
            </div>
            <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
              <dt className="sr-only">Company</dt>
              <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                {mentor && mentor.title}
              </dd>
              <dt className="sr-only">Account status</dt>
              <dd
                className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0 capitalize">
                <CheckCircleIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
                Mentor
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">

        <span>
          <Link href={'/dashboard'}>
            <a
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ChartBarIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true"/>
              Dashboard
            </a>
          </Link>
        </span>

        <span>
          <Link href={'/profile/m/session-history'}>
            <a
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <TableIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true"/>
              Session History
            </a>
          </Link>
        </span>

        <span>
          <Link href={'/profile/m/billing'}>
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
