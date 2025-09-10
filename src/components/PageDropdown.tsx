// src/components/PageDropdown.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const pages = [
  { name: "Index", path: "/" },
  { name: "Auth", path: "/auth" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Symptom Checker", path: "/symptom-checker" },
  { name: "Health Profile", path: "/health-profile" },
  { name: "Medications", path: "/medications" },
  { name: "Mental Health Crisis", path: "/mental-health-crisis" },
];

export default function PageDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Dropdown button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center hover:bg-blue-800 transition-colors"
      >
        Pages <ChevronDownIcon className="ml-2 h-4 w-4" />
      </button>

      {/* Dropdown list */}
      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute mt-2 w-56 bg-gray-100 border border-gray-300 rounded shadow-lg z-50"
        >
          {pages.map((page) => (
            <li key={page.path}>
              <Link
                to={page.path}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-200 hover:text-blue-900 transition-colors"
                onClick={() => setOpen(false)}
              >
                {page.name}
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

