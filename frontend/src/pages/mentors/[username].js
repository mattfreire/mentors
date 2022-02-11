import {useRouter} from 'next/router';
import {useSelector} from 'react-redux';
import Layout from '../../hocs/Layout';
import {API_URL} from "../../config";

const MentorDetail = ({ mentor }) => {
    const router = useRouter();
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);

    if (typeof window !== 'undefined' && !loading && !isAuthenticated)
        router.push('/login');

    const { username } = router.query
    console.log(username)

    return (
        <Layout
            title='httpOnly Auth | Mentor Detail'
            content='Mentor profile'
        >
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
        </Layout>
    );
};

export default MentorDetail;

export async function getServerSideProps(context) {
    const {req} = context
    const {cookies} = req
    const username = "test"
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
            mentor: data
        },
    }
}
