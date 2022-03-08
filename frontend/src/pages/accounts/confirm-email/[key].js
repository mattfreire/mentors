import {useRouter} from "next/router";
import {Message} from "../../../components/Message";
import {useContext, useState} from "react";
import {API_URL} from "../../../config";
import {AuthContext} from "../../../contexts/AuthContext";
import {toast} from "react-hot-toast";


export default function ConfirmEmailPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { query: { key } } = router

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const body = JSON.stringify({ key })
      const apiRes = await fetch(`${API_URL}/api/auth/verify-email/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body
      });
      const res = await apiRes.json()
      if (res.error || res.data) {
        if (res.data && res.data.detail) {
          setError(res.data.detail)
        }
      }
      if (apiRes.status === 200) {
        toast.success('Your email has been confirmed. You can now sign in.', { duration: 5000 })
        await router.push('/login')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (typeof window !== 'undefined' && user)
    router.push('/mentors');

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt="Workflow"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Confirm your email</h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>

            {error && (
              <Message body={error} type="ERROR" onDismiss={() => setError(null)}/>
            )}

            <div>
              <button
                disabled={loading}
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading && (
                  <svg className="animate-spin ml-3 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
