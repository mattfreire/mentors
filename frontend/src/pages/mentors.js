import {useRouter} from 'next/router';
import Link from 'next/link'
import {API_URL} from "../config";
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";

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
          {mentors.map(mentor => (
            <div key={mentor.user.username}>
              <Link href={`/mentors/${mentor.user.username}`}>
                <h3>{mentor.user.username}</h3>
              </Link>
              <p>{mentor.is_active ? "Active" : "Inactive"}</p>
            </div>
          ))}
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
