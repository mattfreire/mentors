import { useRouter } from 'next/router';
import Link from "next/link";
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";

const Dashboard = () => {
    const router = useRouter();
    const { user, loading } = useContext(AuthContext)

    if (typeof window !== 'undefined' && !user && !loading)
        router.push('/login');

    return (
        <div className='p-5 bg-light rounded-3'>
            <div className='container-fluid py-3'>
                <h1 className='display-5 fw-bold'>
                    User Dashboard
                </h1>
                <p className='fs-4 mt-3'>
                    Welcome {user && user.first_name} to the httpOnly Auth Tutorial Site!
                </p>
                <Link href='/stripe-connect'>
                    <a>
                        Connect Stripe Account
                    </a>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;

export async function getServerSideProps(context) {
  return {
    props: {
      protected: true
    },
  }
}
