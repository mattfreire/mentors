import {useRouter} from 'next/router';
import Link from 'next/link'
import {API_URL} from "../config";
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";


function Mentor({ mentor }) {
  const {user} = useContext(AuthContext)

  return (
    <div className="py-3 px-3 border border-gray-200 shadow-sm mt-3">
      <Link href={user.username === mentor.user.username ? "/profile/m" : `/mentors/${mentor.user.username}`}>
        <h3 className="text-xl font-bold text-gray-900">{mentor.user.username}</h3>
      </Link>
      <p className="text-lg text-gray-900">{mentor.title}</p>
      <p className="text-gray-500">{mentor.bio}</p>
    </div>
  )
}

const MentorList = ({mentors}) => {
  const router = useRouter();
  const {user} = useContext(AuthContext)

  if (typeof window !== 'undefined' && !user)
    router.push('/login');

  return (
    <div className='p-5 bg-light rounded-3'>
      <div className='container-fluid py-3'>
        <h1 className='display-5 fw-bold'>
          Find a Mentor
        </h1>
        <div className='fs-4 mt-3'>
          {mentors.map(mentor => <Mentor mentor={mentor} key={mentor.id} /> )}
        </div>
      </div>
    </div>
  );
};

export default MentorList;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/mentors/`, {
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
      mentors: data,
      protected: true
    },
  }
}
