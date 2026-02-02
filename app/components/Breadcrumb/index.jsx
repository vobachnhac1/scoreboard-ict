import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = ({ navigation }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;

      for (const item of navigation) {
        if (item.children) {
          const child = item.children.find((c) => c.href === currentPath);
          if (child) {
            if (item.href) {
              breadcrumbs.push({ name: item.name, href: item.href });
            } else {
              breadcrumbs.push({ name: item.name });
            }
            breadcrumbs.push({ name: child.name, href: child.href });
            break;
          }
        } else if (item.href === currentPath) {
          breadcrumbs.push({ name: item.name, href: item.href });
          break;
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav
      className="text-sm text-gray-600 dark:text-gray-400 mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="list-reset flex">
        <li>
          <Link
            to="/"
            className="text-primary dark:text-blue-400 hover:underline hover:text-primary/90 dark:hover:text-blue-300"
          >
            Trang chủ
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            <span className="mx-2 dark:text-gray-500">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-500 dark:text-gray-400 cursor-not-allowed">
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-primary dark:text-blue-400 hover:underline hover:text-primary/90 dark:hover:text-blue-300"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
