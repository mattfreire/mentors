import {useRouter} from 'next/router';
import {useContext} from "react";
import {AuthContext} from "../../../contexts/AuthContext";
import {UserProfileNavbar} from "../../../components/UserProfileNavbar";
import {API_URL} from "../../../config";


const UserBilling = ({accessToken}) => {
  const router = useRouter();
  const {user, loading} = useContext(AuthContext)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  async function createCustomerPortalSession() {
    try {
      const apiRes = await fetch(`${API_URL}/api/stripe-customer-portal/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        }
      });
      if (apiRes.status === 200) {
        const data = await apiRes.json();
        window.location.href = data.url
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className='p-5 bg-light rounded-3'>
      <div className='container-fluid py-3'>
        <h1 className='display-5 fw-bold'>
          User Profile
        </h1>
        <UserProfileNavbar/>
      </div>
      <div>
       <button onClick={createCustomerPortalSession}>Go to Customer Portal</button>
      </div>
    </div>
  );
};

export default UserBilling;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  return {
    props: {
      protected: true,
      accessToken: cookies.access ? cookies.access : null
    },
  }
}
