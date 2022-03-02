import { useRouter } from 'next/router';
import {useContext, useState} from "react";
import useSWR, {SWRConfig, useSWRConfig} from "swr";
import {useFormik} from "formik";
import { FileUploader } from "react-drag-drop-files";
import {AuthContext} from "../../contexts/AuthContext";
import {MentorProfileNavbar} from "../../components/MentorProfileNavbar";
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
  const [imgPreview, setImgPreview] = useState(null)
  const { user, setUser } = useContext(AuthContext)
  const { mutate } = useSWRConfig()

  const fileTypes = ["JPEG", "PNG"];

  function handleChange(file) {
    setFile(file);
    if (file) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setImgPreview(reader.result)
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      }
    } else {
      setImgPreview(null)
    }
  }

  async function handleSave() {
    try {
      const data = new FormData()
      data.append("profile_picture", file)
      const apiRes = await fetch(`${API_URL}/api/mentors/${mentor.user.username}/`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: data
      });
      if (apiRes.status === 200) {
        const data = await apiRes.json()
        mutate(`${API_URL}/api/mentors/me/`, data)
        mutate(`${API_URL}/api/users/me/`, {...user, profile_picture: data.profile_picture})
        mutate('/api/account/user', { ...user, profile_picture: data.profile_picture })
        handleChange(null)
        setUser({ ...user, profile_picture: data.profile_picture })
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function removePic() {
    try {
      const apiRes = await fetch(`${API_URL}/api/mentors/${mentor.user.username}/`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({profile_picture: null})
      });
      if (apiRes.status === 200) {
        mutate(`${API_URL}/api/mentors/me/`, { ...mentor, profile_picture: null })
        mutate(`${API_URL}/api/users/me/`, { ...user, profile_picture: null })
        mutate('/api/account/user', { ...user, profile_picture: null })
        handleChange(null)
        setUser({ ...user, profile_picture: null })
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
            {imgPreview ? (
              <div>
                <img className="w-24 h-24 px-3 py-3 mr-3 rounded-full" src={imgPreview} alt={""} />
              </div>
            ) : mentor.profile_picture && (
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
              <div className="flex items-center justify-center">
                <p className={"mt-1 text-sm text-gray-500 truncate"}>{file && `Selected file: ${file.name}`}</p>
                {file && (
                  <button className="ml-3 text-sm text-blue-500 hover:text-blue-600" onClick={() => handleChange(null)}>Clear</button>
                )}
              </div>
            </div>
            {!file && mentor.profile_picture && (
              <button className="ml-3 bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded" onClick={removePic}>Remove</button>
            )}
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

function MentorActiveForm({ mentor, accessToken }) {
  const { mutate } = useSWRConfig()

  async function handleSave() {
    try {
      const body = JSON.stringify({
        is_active: !mentor.is_active
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
        mutate(`${API_URL}/api/mentors/me/`, { ...mentor, is_active: !mentor.is_active })
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <button onClick={handleSave} className={
        mentor.is_active ? "bg-red-500 text-white px-3 py-2 rounded-sm hover:bg-red-600" : "bg-blue-500 text-white px-3 py-2 rounded-sm hover:bg-blue-600"
      }>
        {mentor.is_active ? "Hide Profile": "Show Profile"}
      </button>
    </div>
  )
}

const MentorProfile = ({ accessToken }) => {
    const router = useRouter();
    const { user, loading } = useContext(AuthContext)
    const { data: mentor, error} = useSWR(`${API_URL}/api/mentors/me/`)

    if (error) return "An error has occurred.";
    if (!mentor) return "Loading...";

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
        <MentorActiveForm accessToken={accessToken} mentor={mentor} />
      </div>
    );
};

function MentorProfileContainer({ accessToken, fallback }) {
  return (
    <SWRConfig value={{ fallback }}>
      <MentorProfile accessToken={accessToken} />
    </SWRConfig>
  )
}

export default MentorProfileContainer;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/mentors/me/`;
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
      accessToken: cookies.access,
      fallback: {
        [API]: data
      }
    },
  }
}
