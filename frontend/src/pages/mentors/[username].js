import {useRouter} from 'next/router';
import React, {useContext} from "react";
import useSWR, {SWRConfig} from "swr";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";
import {ClientChatbox} from "../../containers/ClientChatbox";
import {MentorProfileHeader} from "../../components/MentorProfileHeader";
import {getProfilePicture} from "../../utils/profilePic";
import {classNames} from "../../utils/classNames";


function Review({review}) {
  const stars = []
  for (let i = 1; i < 6; i++) {
    stars.push(
      <li key={i}>
        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
             className={classNames(
               review.rating >= i ? "text-yellow-500" : "text-gray-300",
               "w-4 mr-1"
             )} role="img" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 576 512">
          <path fill="currentColor"
                d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/>
        </svg>
      </li>
    )
  }

  return (
    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4 lg:space-x-6">
        <img className="w-8 h-8 rounded-full lg:w-12 lg:h-12"
             src={getProfilePicture(review.user.profile_picture, review.user.name)}
             alt={review.user.username}/>
        <div className="font-medium">
          <h3>{review.name}</h3>
          <ul className="mt-1 flex justify-center">
            {stars}
          </ul>
        </div>
        <p className="text-gray-600">{review.description}</p>
      </div>
    </li>
  )
}

function MentorOverview({mentor}) {
  const {accessToken} = useContext(AuthContext)
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }
  const {data: reviews} = useSWR(mentor ? `${API_URL}/api/reviews/?mentor=${mentor.id}` : null, fetcher)

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Mentor Profile</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Bio</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {mentor.bio}
            </dd>
          </div>
          {reviews && reviews.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Recent Sessions</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul role="list" className="mt-3 border-t border-gray-200 rounded-md divide-y divide-gray-200">
                  {reviews.map(review => (
                    <Review review={review} key={review.id}/>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

function MentorDetail() {
  const router = useRouter();
  const {username} = router.query
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
  const {data: mentor} = useSWR(`${API_URL}/api/mentors/${username}/`, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 pb-8">
        <MentorProfileHeader mentor={mentor}/>

        <div className="mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-5">

              {/* Left column */}
              <div className="col-span-2">
                {/* Chat */}
                <div>
                  <div className="mt-2 rounded-lg bg-white overflow-hidden shadow">
                    <div className="px-4 py-3">
                      <ClientChatbox
                        user={user}
                        other={{
                          id: mentor.user.id,
                          first_name: mentor.user.first_name,
                          profile_picture: mentor.profile_picture
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-3">

                <div className="mt-2">
                  <MentorOverview mentor={mentor}/>
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>

      <footer className="mt-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="border-t border-gray-200 py-8 text-sm text-gray-500 text-center sm:text-left">
            <span className="block sm:inline">&copy; {new Date().getFullYear()} The Independent Dev</span>{' '}
          </div>
        </div>
      </footer>
    </div>
  );
}

function MentorDetailPage({fallback}) {
  return (
    <SWRConfig value={{fallback}}>
      <MentorDetail/>
    </SWRConfig>
  )
}

export default MentorDetailPage;

export async function getServerSideProps(context) {
  const {req, query} = context
  const {cookies} = req
  const {username} = query
  const API = `${API_URL}/api/mentors/${username}/`;
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
