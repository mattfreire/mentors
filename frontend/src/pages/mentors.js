import React, {useContext, useState} from "react";
import {useRouter} from 'next/router';
import Link from 'next/link'
import useSWR from "swr";
import {ArrowNarrowLeftIcon, ArrowNarrowRightIcon, ChevronRightIcon} from "@heroicons/react/solid";
import {API_URL} from "../config";
import {AuthContext} from "../contexts/AuthContext";
import {getProfilePicture} from "../utils/profilePic";
import {CurrencyDollarIcon} from "@heroicons/react/outline";

function Mentor({mentor}) {
  const {user} = useContext(AuthContext)

  function formatRate(rate) {
    return "$" + rate / 100
  }

  const stars = []
  for (let i = 1; i < mentor.average_rating + 1; i++) {
    stars.push(
      <li key={i}>
        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
             className={"text-yellow-500 w-4 mr-1"} role="img" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 576 512">
          <path fill="currentColor"
                d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/>
        </svg>
      </li>
    )
  }

  return (
    <li>
      <Link href={user.username === mentor.user.username ? "/profile/m" : `/mentors/${mentor.user.username}`}>
        <a className="group block">
          <div className="flex items-center py-5 px-4 sm:py-6 sm:px-0">
            <div className="min-w-0 flex-1 flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full group-hover:opacity-75"
                  src={getProfilePicture(mentor.profile_picture, mentor.user.name)}
                  alt={mentor.user.username}
                />
              </div>
              <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                <div>
                  <p className="text-sm font-medium text-purple-600 truncate">{mentor.user.name}</p>
                  <p className="mt-1 flex items-center text-base text-gray-800">
                    {mentor.title}
                  </p>
                  <p className="mt-1 flex items-center text-sm text-gray-500">
                    {mentor.bio}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div>
                    {mentor.session_count > 5 && (
                      <>
                        <p className="text-sm text-gray-900">
                          {mentor.session_count} sessions
                        </p>
                        {mentor.average_rating && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-900">
                              Average rating of {mentor.average_rating} stars
                            </p>
                            <div className={"flex mt-1"}>
                              {stars}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <p className="mt-3 flex items-center text-sm text-gray-500">
                      <CurrencyDollarIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      {formatRate(mentor.rate)} per 15 mins
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ChevronRightIcon
                className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                aria-hidden="true"
              />
            </div>
          </div>
        </a>
      </Link>
    </li>
  )
}

function MentorList() {
  const router = useRouter();
  const [page, setPage] = useState(1)
  const {user, accessToken, loading} = useContext(AuthContext)
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }
  const {data: mentors} = useSWR(`${API_URL}/api/mentors/?page=${page}`, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <>
      <header className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Mentors</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-8 pb-16">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          {/* Stacked list */}
          <ul role="list" className="mt-5 border-t border-gray-200 divide-y divide-gray-200 sm:mt-0 sm:border-t-0">
            {mentors && mentors.results.map((mentor) => (
              <Mentor mentor={mentor} key={mentor.id}/>
            ))}
          </ul>

          {/* Pagination */}
          {mentors && (mentors.next || mentors.previous) && (
            <nav
              className="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0"
              aria-label="Pagination"
            >
              <div className="-mt-px w-0 flex-1 flex">
                {mentors.previous && (
                  <span
                    onClick={() => setPage(page - 1)}
                    className="cursor-pointer border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-200"
                  >
                  <ArrowNarrowLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true"/>
                  Previous
                </span>
                )}
              </div>
              <div className="hidden md:-mt-px md:flex">
              </div>
              <div className="-mt-px w-0 flex-1 flex justify-end">
                {mentors.next && (
                  <span
                    onClick={() => setPage(page + 1)}
                    className="cursor-pointer border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-200"
                  >
                  Next
                  <ArrowNarrowRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true"/>
                </span>
                )}
              </div>
            </nav>
          )}
        </div>
      </main>
    </>
  )
}

export default MentorList;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/mentors/`
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    }).then((res) => res.json());
  }
  const data = await fetcher(API);
  return {
    props: {
      protected: true,
      fallback: {
        [API]: data
      }
    },
  }
}
