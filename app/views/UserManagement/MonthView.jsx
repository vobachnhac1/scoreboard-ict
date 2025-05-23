import React, { Fragment, useState } from 'react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';
import { Avatar, Empty, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const days = [
  { date: '2021-12-27', users: [] },
  { date: '2021-12-28', users: [] },
  { date: '2021-12-29', users: [] },
  { date: '2021-12-30', users: [] },
  { date: '2021-12-31', users: [] },
  { date: '2022-01-01', isCurrentMonth: true, users: [] },
  { date: '2022-01-02', isCurrentMonth: true, users: [] },
  {
    date: '2022-01-03',
    isCurrentMonth: true,
    users: [
      {
        id: 1,
        name: 'Design review',
        title: '10AM',
        email: '2022-01-03T10:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      },
      {
        id: 2,
        name: 'Sales meeting',
        title: '2PM',
        email: '2022-01-03T14:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      },
      {
        id: 3,
        name: 'Sales meeting',
        title: '2PM',
        email: '2022-01-03T14:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      },
      {
        id: 4,
        name: 'Sales meeting',
        title: '2PM',
        email: '2022-01-03T14:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      }
    ]
  },
  { date: '2022-01-04', isCurrentMonth: true, users: [] },
  { date: '2022-01-05', isCurrentMonth: true, users: [] },
  { date: '2022-01-06', isCurrentMonth: true, users: [] },
  {
    date: '2022-01-07',
    isCurrentMonth: true,
    users: [
      {
        id: 3,
        name: 'Date night',
        title: '6PM',
        email: '2022-01-08T18:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      }
    ]
  },
  { date: '2022-01-08', isCurrentMonth: true, users: [] },
  { date: '2022-01-09', isCurrentMonth: true, users: [] },
  { date: '2022-01-10', isCurrentMonth: true, users: [] },
  { date: '2022-01-11', isCurrentMonth: true, users: [] },
  {
    date: '2022-01-12',
    isCurrentMonth: true,
    isToday: true,
    users: [
      {
        id: 6,
        name: "Sam's birthday party",
        title: '2PM',
        email: '2022-01-25T14:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      }
    ]
  },
  { date: '2022-01-13', isCurrentMonth: true, users: [] },
  { date: '2022-01-14', isCurrentMonth: true, users: [] },
  { date: '2022-01-15', isCurrentMonth: true, users: [] },
  { date: '2022-01-16', isCurrentMonth: true, users: [] },
  { date: '2022-01-17', isCurrentMonth: true, users: [] },
  { date: '2022-01-18', isCurrentMonth: true, users: [] },
  { date: '2022-01-19', isCurrentMonth: true, users: [] },
  { date: '2022-01-20', isCurrentMonth: true, users: [] },
  { date: '2022-01-21', isCurrentMonth: true, users: [] },
  {
    date: '2022-01-22',
    isCurrentMonth: true,
    isSelected: true,
    users: [
      {
        id: 4,
        name: 'Maple syrup museum',
        title: '3PM',
        email: '2022-01-22T15:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      },
      {
        id: 5,
        name: 'Hockey game',
        title: '7PM',
        email: '2022-01-22T19:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      }
    ]
  },
  { date: '2022-01-23', isCurrentMonth: true, users: [] },
  { date: '2022-01-24', isCurrentMonth: true, users: [] },
  { date: '2022-01-25', isCurrentMonth: true, users: [] },
  { date: '2022-01-26', isCurrentMonth: true, users: [] },
  { date: '2022-01-27', isCurrentMonth: true, users: [] },
  { date: '2022-01-28', isCurrentMonth: true, users: [] },
  { date: '2022-01-29', isCurrentMonth: true, users: [] },
  { date: '2022-01-30', isCurrentMonth: true, users: [] },
  { date: '2022-01-31', isCurrentMonth: true, users: [] },
  { date: '2022-02-01', users: [] },
  { date: '2022-02-02', users: [] },
  { date: '2022-02-03', users: [] },
  {
    date: '2022-02-04',
    users: [
      {
        id: 7,
        name: 'Cinema with friends',
        title: '9PM',
        email: '2022-02-04T21:00',
        href: '#',
        avatar: '../../assets/avatar.jpg'
      }
    ]
  },
  { date: '2022-02-05', users: [] },
  { date: '2022-02-06', users: [] }
];
const selectedDay = days.find((day) => day.isSelected);

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ModalShowUsers = ({ users, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} width={800} centered footer={false}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              {t('subject')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('school')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('status')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users?.length > 0 ? (
            users.map((person, index) => (
              <tr key={`${person.email}_${index}`}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                  {person.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>
              </tr>
            ))
          ) : (
            <Empty description={t('not_found')} />
          )}
        </tbody>
      </table>
    </Modal>
  );
};

export default function MonthView({ isOpenMonth, setIsOpenMonth }) {
  const [selectedDaysUsers, setSelectedDaysUsers] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal open={isOpenMonth} onCancel={() => setIsOpenMonth(false)} footer={false} width={1200}>
      <div className="lg:flex lg:h-full lg:flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            <time dateTime="2022-01">January 2022</time>
          </h1>
          <div className="flex items-center">
            <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
              <button
                type="button"
                className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              >
                This month
              </button>
              <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
              <button
                type="button"
                className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {/* <div className="hidden md:ml-4 md:flex md:items-center">
              <Menu as="div" className="relative">
                <Menu.Button
                  type="button"
                  className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Month view
                  <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
                  <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            Day view
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            Week view
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            Month view
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            Year view
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <div className="ml-6 h-6 w-px bg-gray-300" />
              <button
                type="button"
                className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Add user
              </button>
            </div> */}
            <Menu as="div" className="relative ml-6 md:hidden">
              <Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
                <span className="sr-only">Open menu</span>
                <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
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
                <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Create user
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Go to today
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Day view
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Week view
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Month view
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Year view
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </header>
        <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
          <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
            <div className="bg-white py-2">
              M<span className="sr-only sm:not-sr-only">on</span>
            </div>
            <div className="bg-white py-2">
              T<span className="sr-only sm:not-sr-only">ue</span>
            </div>
            <div className="bg-white py-2">
              W<span className="sr-only sm:not-sr-only">ed</span>
            </div>
            <div className="bg-white py-2">
              T<span className="sr-only sm:not-sr-only">hu</span>
            </div>
            <div className="bg-white py-2">
              F<span className="sr-only sm:not-sr-only">ri</span>
            </div>
            <div className="bg-white py-2">
              S<span className="sr-only sm:not-sr-only">at</span>
            </div>
            <div className="bg-white py-2">
              S<span className="sr-only sm:not-sr-only">un</span>
            </div>
          </div>
          <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
            <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
              {days.map((day) => (
                <div
                  key={day.date}
                  className={classNames(
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-500',
                    'relative px-3 py-2'
                  )}
                >
                  <time
                    dateTime={day.date}
                    className={
                      day.isToday
                        ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
                        : undefined
                    }
                  >
                    {day.date.split('-').pop().replace(/^0/, '')}
                  </time>
                  {day.users.length > 0 && (
                    <ol className="mt-2 flex gap-1">
                      {day.users.slice(0, 3).map((user) => (
                        <li
                          key={user.id}
                          onClick={() => {
                            setSelectedDaysUsers(day.users);
                            setIsOpen(true);
                          }}
                        >
                          <Link to={user.href} className="group flex">
                            {/* <Avatar size={20} icon={<UserOutlined />} /> */}
                            <Avatar src={<img src={user.avatar} alt="avatar" />} />
                            {/* <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">
                              {user.name}
                            </p>
                            <time
                              dateTime={user.datetime}
                              className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block"
                            >
                              {user.time}
                            </time> */}
                          </Link>
                        </li>
                      ))}
                      {day.users.length > 2 && (
                        <li className="text-gray-500 cursor-pointer">+ {day.users.length - 3} more</li>
                      )}
                    </ol>
                  )}
                </div>
              ))}
            </div>
            <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
              {days.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  className={classNames(
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                    (day.isSelected || day.isToday) && 'font-semibold',
                    day.isSelected && 'text-white',
                    !day.isSelected && day.isToday && 'text-indigo-600',
                    !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900',
                    !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500',
                    'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10'
                  )}
                >
                  <time
                    dateTime={day.date}
                    className={classNames(
                      day.isSelected && 'flex h-6 w-6 items-center justify-center rounded-full',
                      day.isSelected && day.isToday && 'bg-indigo-600',
                      day.isSelected && !day.isToday && 'bg-gray-900',
                      'ml-auto'
                    )}
                  >
                    {day.date.split('-').pop().replace(/^0/, '')}
                  </time>
                  <span className="sr-only">{day.users.length} users</span>
                  {day.users.length > 0 && (
                    <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                      {day.users.map((user) => (
                        <span key={user.id} className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400" />
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedDay?.users.length > 0 && (
          <div className="px-4 py-10 sm:px-6 lg:hidden">
            <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
              {selectedDay.users.map((user) => (
                <li key={user.id} className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50">
                  <div className="flex-auto">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <time dateTime={user.datetime} className="mt-2 flex items-center text-gray-700">
                      <ClockIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                      {user.time}
                    </time>
                  </div>
                  <Link
                    to={user.href}
                    className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-0 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 focus:opacity-100 group-hover:opacity-100"
                  >
                    Edit<span className="sr-only">, {user.name}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <ModalShowUsers users={selectedDaysUsers} isOpen={isOpen} setIsOpen={setIsOpen} />
    </Modal>
  );
}
