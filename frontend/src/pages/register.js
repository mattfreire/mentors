import {useContext, useState} from 'react';
import { useRouter } from 'next/router';
import Loader from 'react-loader-spinner';
import {AuthContext} from "../contexts/AuthContext";

const RegisterPage = () => {
  const router = useRouter();
  const { user, register } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    re_password: '',
  });

  const {
    username,
    password,
    re_password
  } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true)
    try {
      await register(username, password, re_password)
      setLoading(false)
      router.push('/login')
    } catch (e) {
      setLoading(false)
    }
  };

  if (typeof window !== 'undefined' && user)
    router.push('/dashboard');

  return (
    <div>
      <h1 className='display-4 mt-5'>Register Page</h1>
      <form className='bg-light p-5 mt-5 mb-5' onSubmit={onSubmit}>
        <h3>Create An Account</h3>
        <div className='form-group'>
          <label className='form-label mt-3' htmlFor='username'>
            <strong>Username*</strong>
          </label>
          <input
            className='form-control'
            type='text'
            name='username'
            placeholder='Username*'
            onChange={onChange}
            value={username}
            required
          />
        </div>
        <div className='form-group'>
          <label className='form-label mt-3' htmlFor='password'>
            <strong>Password*</strong>
          </label>
          <input
            className='form-control'
            type='password'
            name='password'
            placeholder='Password*'
            onChange={onChange}
            value={password}
            minLength='8'
            required
          />
        </div>
        <div className='form-group'>
          <label className='form-label mt-3' htmlFor='re_password'>
            <strong>Confirm Password*</strong>
          </label>
          <input
            className='form-control'
            type='password'
            name='re_password'
            placeholder='Confirm Password*'
            onChange={onChange}
            value={re_password}
            minLength='8'
            required
          />
        </div>
        {
          loading ? (
            <div className='d-flex justify-content-center align-items-center mt-5'>
              <Loader
                type='Oval'
                color='#00bfff'
                width={50}
                height={50}
              />
            </div>
          ) : (
            <button className='btn btn-primary mt-5' type='submit'>
              Create Account
            </button>
          )
        }
      </form>
    </div>
  );
};

export default RegisterPage;
