import {useRouter} from 'next/router';
import {useContext} from "react";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";

const MentorDetail = ({mentor}) => {
  const router = useRouter();
  const {username} = router.query
  const {user, loading} = useContext(AuthContext)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <div className='p-5 bg-light rounded-3'>
      <div className='container-fluid py-3'>
        <h1 className='display-5 fw-bold'>
          Mentor Profile
        </h1>
        <div className='fs-4 mt-3'>
          {username}{" "}
          {mentor.is_active ? "Active" : "Inactive"}
        </div>
      </div>
    </div>
  );
};

export default MentorDetail;

export async function getServerSideProps(context) {
  const {req, query} = context
  const {cookies} = req
  const {username} = query
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/mentors/${username}/`, {
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
      mentor: data,
      protected: true
    },
  }
}
