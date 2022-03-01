import { useRouter } from 'next/router';
import {useContext, useState} from "react";
import { FileUploader } from "react-drag-drop-files";
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


function MentorProfilePictureForm({ mentor, accessToken }) {
  const [file, setFile] = useState(null);
  const handleChange = (file) => {
    setFile(file);
  };
  const fileTypes = ["JPEG", "PNG"];

  async function handleSave() {
    try {
      const data = new FormData()
      data.append("profile_picture", file)
      data.append("title", mentor.title)
      data.append("bio", mentor.bio)
      const apiRes = await fetch(`${API_URL}/api/mentors/${mentor.user.username}/`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: data
      });
      if (apiRes.status === 200) {
        const data = await apiRes.json();
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Mentor Profile Picture</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">This picture will be publicly displayed.</p>
      </div>
      <div className="space-y-6 sm:space-y-5">
        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
            Profile Picture
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2 flex items-center">
            {mentor.profile_picture && (
              <div>
                <img className="w-24 h-24 px-3 py-3 mr-3 rounded-full" src={mentor.profile_picture} alt={""} />
              </div>
            )}
            <div>
              <FileUploader
                multiple={false}
                handleChange={handleChange}
                name="file"
                types={fileTypes}
              />
              <p>{file ? `File name: ${file.name}` : "no files uploaded yet"}</p>
            </div>
          </div>
        </div>
      </div>
      {file && (
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
            <MentorProfilePictureForm accessToken={accessToken} mentor={mentor} />
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
