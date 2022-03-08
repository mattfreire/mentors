import {useRouter} from 'next/router';
import Link from "next/link";
import React, {useContext} from "react";
import useSWR, {SWRConfig} from "swr";
import {AuthContext} from "../../../contexts/AuthContext";
import {API_URL} from "../../../config";
import {DashboardLayout} from "../../../components/DashboardLayout";
import {classNames} from "../../../utils/classNames";

function ClientSessionHistory() {
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
  const {data: sessions} = useSWR(`${API_URL}/api/sessions/client_session_history/`, fetcher)

  function formatPrice(price) {
    return price / 100
  }

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <DashboardLayout client>
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
                    Mentor
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
                </thead>
                <tbody>
                {sessions.length === 0 && (
                  <tr className="bg-white">
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                      <Link href={`/mentors/${session.mentor_profile.username}`}>
                        {session.mentor_profile.full_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span>{("0" + Math.floor((session.session_length / 3600) % 60)).slice(-2)}:</span>
                      <span>{("0" + Math.floor((session.session_length / 60) % 60)).slice(-2)}:</span>
                      <span>{("0" + (session.session_length % 60)).slice(-2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${formatPrice(session.price)}
                    </td>
                    <td className="hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500 md:block">
                      <span
                        className={classNames(
                          session.paid ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
                        )}
                      >
                        {session.paid ? "Paid" : "Waiting for payment"}
                      </span>
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


function ClientSessionHistoryPage({fallback}) {
  return (
    <SWRConfig value={{fallback}}>
      <ClientSessionHistory/>
    </SWRConfig>
  )
}


export default ClientSessionHistoryPage;


export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/sessions/client_session_history/`
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
