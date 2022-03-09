import {CheckCircleIcon} from "@heroicons/react/solid";
import {CashIcon} from "@heroicons/react/outline";
import {getProfilePicture} from "../utils/profilePic";


export function MentorProfileHeader({mentor}) {

  function displayRate(rate) {
    return rate / 100
  }

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">

          <div className="flex-1 min-w-0">
            {/* Profile */}
            <div className="flex items-center">
              <img
                className="hidden h-16 w-16 rounded-full sm:block"
                src={getProfilePicture(mentor.profile_picture, mentor.user.name)}
                alt={mentor.user.username}
              />
              <div>
                <div className="flex items-center">
                  <img
                    className="h-16 w-16 rounded-full sm:hidden"
                    src={getProfilePicture(mentor.profile_picture, mentor.user.name)}
                    alt={mentor.user.username}
                  />
                  <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                    {mentor.user.name}
                  </h1>
                </div>
                <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                  <dt className="sr-only">Title</dt>
                  <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                    {mentor.title}
                  </dd>
                  <dt className="sr-only">Status</dt>
                  <dd
                    className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0 capitalize">
                    <CheckCircleIcon
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                      aria-hidden="true"
                    />
                    Mentor
                  </dd>
                  <dt className="sr-only">Rate</dt>
                  <dd
                    className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0">
                    <CashIcon
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    ${displayRate(mentor.rate)} per 15 mins
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          {/*<div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">*/}
          {/*  <span className="hidden sm:block">*/}
          {/*    <Link href={'/profile/m'}>*/}
          {/*      <a*/}
          {/*        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"*/}
          {/*      >*/}
          {/*        <UserCircleIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true"/>*/}
          {/*        Profile*/}
          {/*      </a>*/}
          {/*    </Link>*/}
          {/*  </span>*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  )
}
