import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Layout from '../hocs/Layout';
import {API_URL} from "../config";

const MentorList = ({ mentors }) => {
    const router = useRouter();

    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);

    if (typeof window !== 'undefined' && !loading && !isAuthenticated)
        router.push('/login');

    return (
        <Layout
            title='httpOnly Auth | Mentors'
            content='All of the mentors'
        >
            <div className='p-5 bg-light rounded-3'>
                <div className='container-fluid py-3'>
                    <h1 className='display-5 fw-bold'>
                        Find a Mentor
                    </h1>
                    <div className='fs-4 mt-3'>
                        {mentors.map(mentor => (
                            <div key={mentor.user}>
                                <h3>User ID: {mentor.user}</h3>
                                <p>{mentor.is_active ? "Active" : "Inactive"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MentorList;

export async function getServerSideProps(context) {
  const { req } = context
  const { cookies } = req
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
      data = await apiRes.json();
    } catch (err) {
      console.error(err)
    }
  return {
    props: {
        mentors: data
    },
  }
}
