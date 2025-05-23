import React, { Fragment, useState } from 'react';
import { Dialog, DialogPanel, Menu, Transition, TransitionChild } from '@headlessui/react';
import {
  AcademicCapIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import English from '../Icons/English';
import Vietnamese from '../Icons/Vietnam';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SidebarLayout = ({ children }) => {
  const dispatch = useDispatch();

  const { language } = useSelector((state) => state.language);
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [navigation, setNavigation] = useState([
    { name: 'home_page', href: '/', icon: HomeIcon, current: true },
    { name: 'newsfeed', href: '/feed', icon: FolderIcon, current: false },
    { name: 'qr_export', href: '/qr-views', icon: HomeIcon, current: false },
    { name: 'subjects_management', href: '/system-management', icon: AcademicCapIcon, current: false },
    { name: 'school_management', href: '/user-management', icon: UsersIcon, current: false },
    { name: 'user_info', href: '/user-info', icon: DocumentDuplicateIcon, current: false }
  ]);

  const handleLinkClick = (clickedLink) => {
    setNavigation(
      navigation.map((link) => {
        if (link.name === clickedLink.name) {
          return { ...link, current: true };
        } else {
          return { ...link, current: false };
        }
      })
    );
  };

  const handleChangeLanguage = () => {
    if (language === 'EN') {
      dispatch({ type: 'SET_LANGUAGE', payload: 'VI' }); // to set the language to E
    } else {
      dispatch({ type: 'SET_LANGUAGE', payload: 'EN' }); // to set the language to E
    }
  };

  return (
    <div className="w-full h-full">
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </TransitionChild>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
                      alt="Your Company"
                    />
                  </div>

                  <English className={'w-6 h-6'} />

                  <nav className="flex flex-1 flex-col">
                    <ul className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={classNames(
                                  item.current
                                    ? 'bg-gray-50 text-sky-600'
                                    : 'text-gray-700 hover:text-sky-600 hover:bg-gray-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                                onClick={() => handleLinkClick(item)}
                              >
                                <item.icon
                                  className={classNames(
                                    item.current ? 'text-sky-600' : 'text-gray-400 group-hover:text-sky-600',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {t(item.name)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <Link
                          to="/"
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-sky-600"
                        >
                          <Cog6ToothIcon
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-sky-600"
                            aria-hidden="true"
                          />
                          Settings
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col shadow-xl">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
              alt="Your Company"
            />

            <div className="flex gap-2 items-center">
              <English
                className={'w-7 h-7 cursor-pointer'}
                onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'EN' })}
              />
              <Vietnamese
                className={'w-7 h-7 cursor-pointer'}
                onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'VI' })}
              />
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => handleLinkClick(item)}
                        className={classNames(
                          item.current
                            ? 'bg-gray-50 text-sky-600'
                            : 'text-gray-700 hover:text-sky-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current ? 'text-sky-600' : 'text-gray-400 group-hover:text-sky-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {t(item.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto w-full">
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5 w-full">
                    <span className="sr-only">Open settings</span>
                    <div className="flex gap-2">
                      <Cog6ToothIcon
                        className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-sky-600"
                        aria-hidden="true"
                      />
                      Settings
                    </div>
                  </Menu.Button>
                  {/* <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 bottom-9 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      <Menu.Item>
                        <button
                          onClick={() => handleChangeLanguage()}
                          className={classNames('block px-3 py-1 text-sm leading-6 text-gray-900 whitespace-nowrap')}
                        >
                          {language === 'VI' ? 'Vietnamese' : 'English'}
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition> */}
                </Menu>
              </li>
              <li>
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full bg-gray-50"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                        Tom Cook
                      </span>
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 bottom-9 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      {/* {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'block px-3 py-1 text-sm leading-6 text-gray-900'
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))} */}
                      <Menu.Item>
                        <Link
                          to="/login"
                          className={classNames('block px-3 py-1 text-sm leading-6 text-gray-900 whitespace-nowrap')}
                        >
                          {t('login')}
                        </Link>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72 w-full h-full bg-gray-100">
        {/* <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

            </div>
          </div>
        </div> */}

        <main className="h-full">
          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
