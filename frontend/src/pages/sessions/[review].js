import {useRouter} from 'next/router';
import {useContext} from "react";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";

const Review = ({mentorSession, accessToken}) => {
  const router = useRouter();
  const {user, loading} = useContext(AuthContext)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <div className='p-5 bg-light rounded-3'>
      <div className='container-fluid py-3'>
        <h1 className='display-5 fw-bold'>
          Review
        </h1>
        <div className='fs-4 mt-3'>
          Thanks for paying for the session: {mentorSession.id}
        </div>
      </div>
    </div>
  );
};

export default Review;

export async function getServerSideProps(context) {
  const {req, query} = context
  const {cookies} = req
  const {sessionId} = query
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/sessions/${sessionId}/`, {
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
      mentorSession: data,
      protected: true,
      accessToken: cookies.access
    },
  }
}
