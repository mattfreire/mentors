import Link from 'next/link';
import { useRouter } from 'next/router';
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";

const navbar = () => {
    const router = useRouter();
    const { user, logout } = useContext(AuthContext)

    const logoutHandler = () => {
        logout()
    };

    const authLinks = (
        <>
            <li className='nav-item'>
                <Link href='/dashboard'>
                    <a className={
                        router.pathname === '/dashboard' ?
                        'nav-link active' : 'nav-link'
                    }>
                        Dashboard
                    </a>
                </Link>
            </li>
            <li className='nav-item'>
                <Link  href='/mentors'>
                    <a className={
                        router.pathname === '/mentors' ?
                        'nav-link active' : 'nav-link'
                    }>
                        Mentors
                    </a>
                </Link>
            </li>
            <li className='nav-item'>
                <a
                    className='nav-link'
                    href='#!'
                    onClick={logoutHandler}
                >
                    Logout
                </a>
            </li>
        </>
    );

    const guestLinks = (
        <>
            <li className='nav-item'>
                <Link href='/register'>
                    <a className={
                        router.pathname === '/register' ?
                        'nav-link active' : 'nav-link'
                    }>
                        Register
                    </a>
                </Link>
            </li>
            <li className='nav-item'>
                <Link href='/login'>
                    <a className={
                        router.pathname === '/login' ?
                        'nav-link active' : 'nav-link'
                    }>
                        Login
                    </a>
                </Link>
            </li>
        </>
    );

    return (
        <nav className='navbar navbar-expand-lg navbar-light bg-light'>
            <div className='container-fluid'>
                <Link href='/'>
                    <a className='navbar-brand'>
                        httpOnly Auth
                    </a>
                </Link>
                <button
                    className='navbar-toggler'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#navbarNav'
                    aria-controls='navbarNav'
                    aria-expanded='false'
                    aria-label='Toggle navigation'
                >
                    <span className='navbar-toggler-icon'/>
                </button>
                <div className='collapse navbar-collapse' id='navbarNav'>
                    <ul className='navbar-nav'>
                        <li className='nav-item'>
                            <Link  href='/'>
                                <a className={
                                    router.pathname === '/' ?
                                    'nav-link active' : 'nav-link'
                                }>
                                    Home
                                </a>
                            </Link>
                        </li>
                        {
                            user ? authLinks : guestLinks
                        }
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default navbar;
