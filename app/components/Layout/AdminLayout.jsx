import React, { Fragment } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CheckActive from "./CheckActive";

const AdminLayout = ({ children }) => {
  const [isActive, setIsActive] = React.useState(true);
  const checkActive = (key) => {
    // Simulate an API call to check the license key
    setTimeout(() => {
      setIsActive(true);
    }, 0);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="mt-14" />
      {isActive ? (
        <Fragment>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <div className="flex-1 bg-gray-100 p-4 overflow-auto ml-16 md:ml-64">{children}</div>
          </div>
        </Fragment>
      ) : (
        <CheckActive checkActive={checkActive} />
      )}
    </div>
  );
};

export default AdminLayout;
