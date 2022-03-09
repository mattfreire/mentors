import {useState, useContext} from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import {useFormik} from "formik";
import * as Yup from 'yup';
import {AuthContext} from "../contexts/AuthContext";
import {Message} from "../components/Message";
import {FormField} from "../components/FormField";
import {toast} from "react-hot-toast";


function RegisterPage() {
  const router = useRouter();
  const {user, register} = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const formik = useFormik({
    initialValues: {
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe2',
      email: 'johndoe2@gmail.com',
      password1: 'donkey123',
      password2: 'donkey123',
    },
    validationSchema: Yup.object().shape({
      first_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
      last_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
      username: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password1: Yup.string().min(8, 'Too Short!').required('Required'),
      password2: Yup.string().min(8, 'Too Short!').required('Required'),
    }),
    onSubmit: async (values, {resetForm}) => {
      setLoading(true)
      const {username, email, password1, password2, first_name, last_name} = values;
      const res = await register(username, email, password1, password2, first_name, last_name)
      if (res.error || res.data) {
        if (res.error) {
          if (res.error.data && res.error.data.detail) {
            setError(res.error.data.detail)
          }
        }
        if (res.data) {
          for (const field of Object.keys(res.data)) {
            formik.setErrors({
              [field]: `${res.data[field][0]}`
            })
          }
        }
      } else {
        resetForm()
        toast.success('We have sent you a confirmation email.', { duration: 5000 })
      }
      setLoading(false)
    },
  });

  if (typeof window !== 'undefined' && user) {
    router.push('/mentors');
  }

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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Start your independent journey</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href={"/login"}>
                <a className="font-medium text-indigo-600 hover:text-indigo-500">
                  sign into your account
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
                label={"Username"}
                errors={formik.errors.username}
                value={formik.values.username}
                handleChange={formik.handleChange}
                touched={formik.touched.username}
                fieldType={"text"}
                fieldName={"username"}
                placeholder="joesoap"
              />
              <FormField
                label={"First Name"}
                errors={formik.errors.first_name}
                value={formik.values.first_name}
                handleChange={formik.handleChange}
                touched={formik.touched.first_name}
                fieldType={"text"}
                fieldName={"first_name"}
                placeholder="Joe"
              />
              <FormField
                label={"Last Name"}
                errors={formik.errors.last_name}
                value={formik.values.last_name}
                handleChange={formik.handleChange}
                touched={formik.touched.last_name}
                fieldType={"text"}
                fieldName={"last_name"}
                placeholder="Soap"
              />
              <FormField
                label={"Password"}
                errors={formik.errors.password1}
                value={formik.values.password1}
                handleChange={formik.handleChange}
                touched={formik.touched.password1}
                fieldType={"password"}
                fieldName={"password1"}
                placeholder="password"
              />
              <FormField
                label={"Confirm Password"}
                errors={formik.errors.password2}
                value={formik.values.password2}
                handleChange={formik.handleChange}
                touched={formik.touched.password2}
                fieldType={"password"}
                fieldName={"password2"}
                placeholder="confirm password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
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
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
