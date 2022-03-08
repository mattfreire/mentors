import {useState, useContext} from 'react';
import {useRouter} from 'next/router';
import {useFormik} from "formik";
import * as Yup from 'yup';
import {toast} from "react-hot-toast";
import {AuthContext} from "../../contexts/AuthContext";
import {Message} from "../../components/Message";
import {FormField} from "../../components/FormField";
import {API_URL} from "../../config";


export default function ResetPasswordPage() {
  const router = useRouter();
  const {user} = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true)
      const {email} = values;
      try {
        const body = JSON.stringify({ email })
        const apiRes = await fetch(`${API_URL}/api/auth/reset-password/`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body
        });
        if (apiRes.status === 200) {
          toast.success('We have sent you an email to reset your password.', { duration: 5000 })
          resetForm()
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
  });

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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>

            {error && (
              <Message body={error} type="ERROR" onDismiss={() => setError(null)}/>
            )}

            <div className="rounded-md -space-y-px">
              <FormField
                label={"Email"}
                errors={formik.errors.email}
                value={formik.values.email}
                handleChange={formik.handleChange}
                touched={formik.touched.email}
                fieldType={"email"}
                fieldName={"email"}
                placeholder="Email"
              />
            </div>

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
  );
}
