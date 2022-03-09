import {useState, useContext} from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import {useFormik} from "formik";
import * as Yup from 'yup';
import {AuthContext} from "../contexts/AuthContext";
import {Message} from "../components/Message";
import {FormField} from "../components/FormField";

function LoginPage() {
  const router = useRouter();
  const {user, login} = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(8, 'Too Short!').required('Required'),
    }),
    onSubmit: async values => {
      setLoading(true)
      const {email, password} = values;
      const res = await login(email, password);
      if (res.error || res.data) {
        if (res.data && res.data.detail) {
          setError(res.data.detail)
        }
      } else {
        await router.push('/login')
      }
      setLoading(false)
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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href={"/register"}>
                <a className="font-medium text-indigo-600 hover:text-indigo-500">
                  create an account
                </a>
              </Link>
            </p>
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
              <FormField
                label={"Password"}
                errors={formik.errors.password}
                value={formik.values.password}
                handleChange={formik.handleChange}
                touched={formik.touched.password}
                fieldType={"password"}
                fieldName={"password"}
                placeholder="password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href={"/accounts/reset-password"}>
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </Link>
              </div>
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
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


export default LoginPage;
