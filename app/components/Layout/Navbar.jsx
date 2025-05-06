import React from "react";

const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 shadow z-50 flex items-center px-4 md:px-6 border-b border-gray-300 dark:border-gray-700">
      {/* Logo + Title */}
      <div className="flex items-center">
        {/* <Bars3Icon className="h-6 w-6 text-blue-600" /> */}
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">LOGO</h1>
      </div>
    </div>
  );
};

export default Navbar;
