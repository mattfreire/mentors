import { useRouter } from 'next/router';
import {useContext} from "react";
import {AuthContext} from "../../contexts/AuthContext";
import {MentorProfileNavbar} from "../../components/MentorProfileNavbar";
import {useFormik} from "formik";
import {API_URL} from "../../config";

const MentorProfileForm = ({ mentor, accessToken }) => {
  const formik = useFormik({
    initialValues: {
      title: mentor.title,
      bio: mentor.bio,
    },
    onSubmit: async values => {
      try {
        const body = JSON.stringify(values)
        const apiRes = await fetch(`${API_URL}/api/mentors/${mentor.user.username}/`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body
        });
        console.log(apiRes)
        if (apiRes.status === 200) {
          const data = await apiRes.json();
          console.log(data)
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Mentor Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">This information will be publicly displayed.</p>
          </div>
          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Title
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  onChange={formik.handleChange}
                  value={formik.values.title}
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Bio
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  name="bio"
                  id="bio"
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  onChange={formik.handleChange}
                  value={formik.values.bio}
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


const MentorProfile = ({ mentor, accessToken }) => {
    const router = useRouter();
    const { user, loading } = useContext(AuthContext)

    if (typeof window !== 'undefined' && !user && !loading)
        router.push('/login');

    return (
        <div className='p-5 bg-light rounded-3'>
            <div className='container-fluid py-3'>
                <h1 className='display-5 fw-bold'>
                    Mentor Profile
                </h1>
                <MentorProfileNavbar />
            </div>
            <MentorProfileForm accessToken={accessToken} mentor={mentor} />
        </div>
    );
};

export default MentorProfile;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/mentors/me/`, {
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
      mentor: data,
      protected: true,
      accessToken: cookies.access
    },
  }
}
