import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useContext, Fragment} from "react";
import {Disclosure, Menu, Transition} from '@headlessui/react'
import {MenuIcon, XIcon} from '@heroicons/react/outline'
import {AuthContext} from "../contexts/AuthContext";
import {getProfilePicture} from "../utils/profilePic";
import {classNames} from "../utils/classNames";

export default function Navbar() {
  const router = useRouter();
  const {user} = useContext(AuthContext)

  const navigation = [
    {name: 'Dashboard', href: '/dashboard', onlyMentors: true},
    {name: 'Mentors', href: '/mentors', onlyMentors: false},
  ]

  const userNavigation = [
    {name: 'Profile', href: '/profile/u'},
    {name: 'Sign out', href: '/logout'},
  ]

  return (
    <Disclosure as="nav" className="bg-gray-50">
      {({open}) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="relative h-16 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark.svg?color=violet&shade=500"
                    alt="Workflow"
                  />
                </div>

                {/* Links section */}
                <div className="hidden md:block md:ml-10">
                  <div className="flex space-x-4">
                    {user && navigation.map(item => {
                      if (item.onlyMentors && user && !user.is_mentor) {
                        return null
                      }
                      return (
                        <Link key={item.name} href={item.href}>
                          <a
                            className={classNames(
                              item.href === router.route ? 'bg-gray-100' : 'hover:text-gray-700',
                              'px-3 py-2 rounded-md text-sm font-medium text-gray-900'
                            )}
                            aria-current={item.href === router.route ? 'page' : undefined}
                          >
                            {item.name}
                          </a>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/*<div className="flex-1 px-2 flex justify-center lg:ml-6 lg:justify-end">*/}
              {/*  /!* Search section *!/*/}
              {/*  <div className="max-w-lg w-full lg:max-w-xs">*/}
              {/*    <label htmlFor="search" className="sr-only">*/}
              {/*      Search*/}
              {/*    </label>*/}
              {/*    <div className="relative text-gray-400 focus-within:text-gray-500">*/}
              {/*      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">*/}
              {/*        <SearchIcon className="h-5 w-5" aria-hidden="true"/>*/}
              {/*      </div>*/}
              {/*      <input*/}
              {/*        id="search"*/}
              {/*        className="block w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:placeholder-gray-500 sm:text-sm"*/}
              {/*        placeholder="Search"*/}
              {/*        type="search"*/}
              {/*        name="search"*/}
              {/*      />*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}

              <div className="flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button
                  className="bg-gray-50 p-2 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true"/>
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true"/>
                  )}
                </Disclosure.Button>
              </div>

              {/* Actions section */}
              <div className="hidden md:block md:ml-4">
                <div className="flex items-center">
                  {/* Profile dropdown */}
                  {user ? (
                    <Menu as="div" className="relative flex-shrink-0">
                      <div>
                        <Menu.Button
                          className="bg-gray-50 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500">
                          <span className="sr-only">Open user menu</span>
                          <img className="rounded-full h-8 w-8"
                               src={getProfilePicture(user.profile_picture, user.name)}
                               alt={user.username}
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          className="origin-top-right absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {user && userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({active}) => (
                                <Link href={item.href}>
                                  <a
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block py-2 px-4 text-sm text-gray-700'
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="hidden md:flex items-center justify-end md:flex-1 md:w-0">
                      <Link href={"/login"}>
                        <a className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900">
                          Sign in
                        </a>
                      </Link>
                      <Link href={'/register'}>
                        <a
                          className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                          Sign up
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="bg-gray-50 border-b border-gray-200 md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                if (!item.onlyMentors) {
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={classNames(
                          item.href === router.route ? 'bg-gray-100' : 'hover:bg-gray-100',
                          'block px-3 py-2 rounded-md font-medium text-gray-900'
                        )}
                        aria-current={item.href === router.route ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    </Link>
                  )
                }
                if (user && user.is_mentor) {
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={classNames(
                          item.href === router.route ? 'bg-gray-100' : 'hover:bg-gray-100',
                          'block px-3 py-2 rounded-md font-medium text-gray-900'
                        )}
                        aria-current={item.href === router.route ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    </Link>
                  )
                }
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="px-5 flex items-center">
                  <div className="flex-shrink-0">
                    <img className="rounded-full h-10 w-10"
                         src={getProfilePicture(user.profile_picture, user.name)}
                         alt={user.username}/>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 px-2 space-y-1">
                  <Link href={'/login'}>
                    <a className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                      Sign in
                    </a>
                  </Link>
                  <Link href={'/register'}>
                    <a className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                      Sign up
                    </a>
                  </Link>
                </div>
              )}

              <div className="mt-3 px-2 space-y-1">
                {user && userNavigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <a className="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
