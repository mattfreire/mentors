import {useRouter} from 'next/router';
import React, {useContext} from "react";
import {AuthContext} from "../../../contexts/AuthContext";
import {API_URL} from "../../../config";
import {DashboardLayout} from "../../../components/DashboardLayout";

function UserBilling() {
  const router = useRouter();
  const {user, accessToken, loading} = useContext(AuthContext)

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
    <DashboardLayout client>
      <div>
        <button className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded text-white" onClick={createCustomerPortalSession}>
          Go to Customer Portal
        </button>
        <p className="mt-3 text-gray-600">The customer portal is where you can update your payment methods, view invoices and manage your billing profile.
        <br />It is a secure session hosted by Stripe.</p>
      </div>
    </DashboardLayout>
  );
};

export default UserBilling;

export async function getServerSideProps() {
  return {
    props: {
      protected: true,
    },
  }
}

