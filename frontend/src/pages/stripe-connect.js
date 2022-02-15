import { useRouter } from 'next/router';
import {useContext, useEffect} from "react";
import {AuthContext} from "../contexts/AuthContext";
import {API_URL} from "../config";

const StripeConnect = ({ accessToken  }) => {
    const router = useRouter();
    const { user, loading } = useContext(AuthContext)

    if (typeof window !== 'undefined' && !user && !loading)
        router.push('/login');

    useEffect(() => {
      async function fetchStripeAccountLink() {
        try {
          const apiRes = await fetch(`${API_URL}/api/stripe-connect/`, {
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
      fetchStripeAccountLink()
    }, [])

    return (
        <div className='p-5 bg-light rounded-3'>
            <div className='container-fluid py-3'>
                <h1 className='display-5 fw-bold'>
                    User Dashboard
                </h1>
                <p className='fs-4 mt-3'>
                    Welcome {user && user.first_name} to the httpOnly Auth Tutorial Site!
                </p>
            </div>
        </div>
    );
};

export default StripeConnect;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  return {
    props: {
      protected: true,
      accessToken: cookies.access
    },
  }
}
