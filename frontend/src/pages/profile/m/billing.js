import {useRouter} from 'next/router';
import {useContext} from "react";
import Link from "next/link";
import {AuthContext} from "../../../contexts/AuthContext";
import {UserProfileNavbar} from "../../../components/UserProfileNavbar";

const MentorBilling = () => {
  const router = useRouter();
  const {user, loading} = useContext(AuthContext)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <div className='p-5 bg-light rounded-3'>
      <div className='container-fluid py-3'>
        <h1 className='display-5 fw-bold'>
          User Profile
        </h1>
        <UserProfileNavbar/>
      </div>
      <div>
       <Link href='/stripe-connect'>
          <a>
              Connect Stripe Account
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MentorBilling;

export async function getServerSideProps(context) {
  return {
    props: {
      protected: true,
    },
  }
}
