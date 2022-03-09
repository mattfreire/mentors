import {useRouter} from 'next/router';
import React, {useContext} from "react";
import Link from "next/link";
import {AuthContext} from "../../../contexts/AuthContext";
import {useFormik} from "formik";
import {API_URL} from "../../../config";
import {DashboardLayout} from "../../../components/DashboardLayout";
import useSWR, {SWRConfig} from "swr";

function MentorRateForm({ mentor }) {
  const { accessToken } = useContext(AuthContext)
  const formik = useFormik({
    initialValues: {
      rate: mentor.rate / 100,
    },
    onSubmit: async values => {
      try {
        const body = JSON.stringify({
          rate: values.rate * 100
        })
        const apiRes = await fetch(`${API_URL}/api/mentors/${mentor.user.username}/`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body
        });
        if (apiRes.status === 200) {
          const data = await apiRes.json();
        }
      } catch (err) {
        console.error(err)
      }
    },
  });
  return (
    <form className="space-y-8 divide-y divide-gray-200" onSubmit={formik.handleSubmit}>
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">

        <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Mentor Rate</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Change your rate in USD per 15 mins.</p>
          </div>
          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Rate ($/15 mins)
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="number"
                  name="rate"
                  id="rate"
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  onChange={formik.handleChange}
                  value={formik.values.rate}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

function MentorBilling() {
  const router = useRouter();
  const {user, accessToken, loading} = useContext(AuthContext)
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }
  const {data: mentor} = useSWR(`${API_URL}/api/mentors/me/`, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <DashboardLayout>
      <div>
       <Link href='/stripe-connect'>
          <a className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded text-white">
              Manage Stripe Account
          </a>
        </Link>
      </div>
      <div className="py-5">
        <MentorRateForm mentor={mentor} />
      </div>
    </DashboardLayout>
  );
}

function MentorBillingPage({fallback}) {
  return (
    <SWRConfig value={{fallback}}>
      <MentorBilling />
    </SWRConfig>
  )
}

export default MentorBillingPage;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/mentors/me/`
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    }).then((res) => res.json());
  }
  const data = await fetcher(API);
  return {
    props: {
      protected: true,
      fallback: {
        [API]: data
      }
    },
  }
}
