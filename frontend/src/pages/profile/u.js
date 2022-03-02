import {useRouter} from 'next/router';
import {useContext} from "react";
import {AuthContext} from "../../contexts/AuthContext";
import {UserProfileNavbar} from "../../components/UserProfileNavbar";
import {useFormik} from 'formik';
import {API_URL} from "../../config";

const UserProfileForm = ({ user, accessToken }) => {
  const formik = useFormik({
    initialValues: {
      firstName: user.first_name,
      lastName: user.last_name,
    },
    onSubmit: async values => {
      try {
        const body = JSON.stringify({
          first_name: values.firstName,
          last_name: values.lastName
        })
        const apiRes = await fetch(`${API_URL}/api/users/${username}/`, {
          method: "PUT",
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Use a permanent address where you can receive mail.</p>
          </div>
          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                First name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="firstName"
                  id="first-name"
                  autoComplete="given-name"
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  onChange={formik.handleChange}
                  value={formik.values.firstName}
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Last name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="lastName"
                  id="last-name"
                  autoComplete="family-name"
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  onChange={formik.handleChange}
                  value={formik.values.lastName}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
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


const UserProfile = ({accessToken}) => {
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
        <UserProfileForm user={user} accessToken={accessToken}/>
      </div>
    </div>
  );
};

export default UserProfile;

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
