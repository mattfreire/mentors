import {useRouter} from 'next/router';
import Link from 'next/link'
import {API_URL} from "../config";
import React, {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";
import {
  ArrowNarrowLeftIcon, ArrowNarrowRightIcon,
  ChevronRightIcon,
  MailIcon
} from "@heroicons/react/solid";
import useSWR from "swr";


function Mentor({mentor}) {
  const {user} = useContext(AuthContext)

  return (
    <li>
      <Link href={user.username === mentor.user.username ? "/profile/m" : `/mentors/${mentor.user.username}`}>
        <a className="group block">
          <div className="flex items-center py-5 px-4 sm:py-6 sm:px-0">
            <div className="min-w-0 flex-1 flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full group-hover:opacity-75"
                  src={mentor.profile_picture}
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
                    <span className="truncate">{mentor.bio}</span>
                  </p>
                </div>
                <div className="hidden md:block">
                  <div>
                    {/*<p className="text-sm text-gray-900">*/}
                    {/*  Applied on <time dateTime={candidate.appliedDatetime}>{candidate.applied}</time>*/}
                    {/*</p>*/}
                    {/*<p className="mt-2 flex items-center text-sm text-gray-500">*/}
                    {/*  <CheckCircleIcon*/}
                    {/*    className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"*/}
                    {/*    aria-hidden="true"*/}
                    {/*  />*/}
                    {/*  {candidate.status}*/}
                    {/*</p>*/}
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
  const {data: mentors} = useSWR(`${API_URL}/api/mentors/`, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <>
      <header className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Mentors</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stacked list */}
          <ul role="list" className="mt-5 border-t border-gray-200 divide-y divide-gray-200 sm:mt-0 sm:border-t-0">
            {mentors && mentors.map((mentor) => (
              <Mentor mentor={mentor} key={mentor.id}/>
            ))}
          </ul>

          {/* Pagination */}
          <nav
            className="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0"
            aria-label="Pagination"
          >
            <div className="-mt-px w-0 flex-1 flex">
              <a
                href="#"
                className="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-200"
              >
                <ArrowNarrowLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true"/>
                Previous
              </a>
            </div>
            <div className="hidden md:-mt-px md:flex">
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
              >
                1
              </a>
              {/* Current: "border-purple-500 text-purple-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200" */}
              <a
                href="#"
                className="border-purple-500 text-purple-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
                aria-current="page"
              >
                2
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
              >
                3
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
              >
                4
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
              >
                5
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
              >
                6
              </a>
            </div>
            <div className="-mt-px w-0 flex-1 flex justify-end">
              <a
                href="#"
                className="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-200"
              >
                Next
                <ArrowNarrowRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true"/>
              </a>
            </div>
          </nav>
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
