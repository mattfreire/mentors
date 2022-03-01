import { useRouter } from 'next/router';
import Link from "next/link";
import {useContext} from "react";
import {AuthContext} from "../../../contexts/AuthContext";
import {API_URL} from "../../../config";
import {MentorProfileNavbar} from "../../../components/MentorProfileNavbar";


const MentorSessionHistory = ({ sessions }) => {
    const router = useRouter();
    const { user, loading } = useContext(AuthContext)
    if (typeof window !== 'undefined' && !user && !loading)
        router.push('/login');

    return (
        <div className='p-5 bg-light rounded-3'>
            <div className='container-fluid py-3'>
                <h1 className='display-5 fw-bold'>
                    Session History
                </h1>
                <MentorProfileNavbar />
            </div>

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
                        {sessions.map((session, sessionIdx) => (
                          <tr key={session.id} className={sessionIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(session.start_time).toUTCString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link href={`/mentors/${session.mentor_profile.username}`}>
                                {session.client_profile.full_name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.session_length}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
};

export default MentorSessionHistory;

export async function getServerSideProps(context) {
const {req} = context
  const {cookies} = req
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/sessions/mentor_session_history/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    });
    if (apiRes.status === 200) {
      data = await apiRes.json();
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      sessions: data,
      protected: true
    },
  }
}
