import React, { useState } from "react";
import {
  LockClosedIcon,
  UserCircleIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = (event) => {
    event.preventDefault();
    console.log(userName, password);
  };
  return (
    <div className="bg-slate-100 w-full h-full flex flex-col justify-center items-center">
       <div className = 'bg-white w-1/2 p-[5%] shadow-xl border-2 rounded'>
       <div className="text-4xl font-semibold mb-16 text-center">Login</div>
        <form>
          <div>
            <div className="relative flex items-center">
              <UserCircleIcon
                className="h-6 w-6 absolute top-[1.2rem] left-4"
                aria-hidden="true"
                color="gray"
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full border-2 py-4 px-12 rounded-md border-slate-200 mb-5"
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="relative flex items-center">
              <LockClosedIcon
                className="h-6 w-6 absolute top-[1.2rem] left-4"
                aria-hidden="true"
                color="gray"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border-2 py-4 px-12 rounded-md border-slate-200"
                onChange={(e) => setPassword(e.target.value)}
              />
              <EyeSlashIcon
                className="h-6 w-6 absolute top-4 right-4"
                aria-hidden="true"
                color="gray"
              />
            </div>
            <div className="flex justify-between py-3 ">
              <div className="flex items-center">
                <input className="rounded" type="checkbox" />{" "}
                <span className="ml-2 text-slate-500">Remember me</span>
              </div>
              <button className="text-sky-600 cursor-pointer hover:underline font-semibold">
                Forgot Password?
              </button>
            </div>
          </div>
        </form>
        <button
          className="py-4 w-full bg-sky-600 text-white rounded-md mt-3"
          onClick={handleLogin}
        >
          Log in
        </button>

        <div className="mt-10 text-slate-500 text-center">
          Don't have an account?{" "}
          <span className="text-sky-600 cursor-pointer hover:underline">
            Create an account
          </span>
        </div>
       </div>
    </div>
  );
};

export default Login;
