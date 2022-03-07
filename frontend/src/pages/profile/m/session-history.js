import {useRouter} from 'next/router';
import React, {useContext} from "react";
import {AuthContext} from "../../../contexts/AuthContext";
import {API_URL} from "../../../config";
import {DashboardLayout} from "../../../components/DashboardLayout";
import useSWR, {SWRConfig} from "swr";


function MentorSessionHistory() {
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
  const {data: sessions} = useSWR(`${API_URL}/api/sessions/mentor_session_history/`, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  function formatPrice(price) {
    return price / 100
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Length
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                </tr>
                </thead>
                <tbody>
                {sessions.length === 0 && (
                  <tr className="bg-white">
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      You haven't had any sessions, yet!
                    </td>
                  </tr>
                )}
                {sessions.map((session, sessionIdx) => (
                  <tr key={session.id} className={sessionIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(session.start_time).toUTCString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.client_profile.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span>{("0" + Math.floor((session.session_length / 3600) % 60)).slice(-2)}:</span>
                      <span>{("0" + Math.floor((session.session_length / 60) % 60)).slice(-2)}:</span>
                      <span>{("0" + (session.session_length % 60)).slice(-2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${formatPrice(session.price)}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

function MentorSessionHistoryPage({ fallback }) {
  return (
    <SWRConfig value={{fallback}}>
      <MentorSessionHistory />
    </SWRConfig>
  )
}

export default MentorSessionHistoryPage;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/sessions/mentor_session_history/`;
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
