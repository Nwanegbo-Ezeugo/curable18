import { supabase } from "@/integrations/supabase/client";
import { UserMetadata } from "@supabase/supabase-js";
import { NONAME } from "dns";
import { Stethoscope } from "lucide-react";
import { JSXElementConstructor, ReactElement, ReactNode, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";


type UserData = {
  name?: string;
  email?: string;
};

export default function Sidebar() {
  const [open, setOpen] = useState(false); // for user dropdown
  const [mobileMenu, setMobileMenu] = useState(false); // for mobile sidebar
const [user, setUser] = useState<UserData | null>(null);
  let mic = "";
//   const [name, setName] = useState<string | null>(null);

    async function getInfo () {
        const {
            data: { user },
            } = await supabase.auth.getUser()
            let metadata = user?.user_metadata.full_name
            mic = user?.user_metadata.full_name
            console.log(metadata)
            console.log(mic)
    }

     useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.user_metadata?.full_name,  // comes from signup
          email: user.email,               // Supabase always stores email
        });
      }
    };

    getUser();
  }, []);


  async function signOut() {
    const { error } = await supabase.auth.signOut();
  }

  return (
    <div className="flex min-h-screen">
      {/* Top Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="md:flex items-center space-x-2 hidden">
              <Stethoscope className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Curable
              </h1>
            </div>

            {/* Mobile menu toggle */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Profile dropdown */}
            <div className="flex items-center">
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                >
                 <img
                    className="w-8 h-8 rounded-full"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email ?? "guest"}`}
                    alt="user avatar"
                    />

                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </span>
                </button>

                {open && (
                  <div className="absolute right-2.5 mt-2 w-fit z-50 bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={signOut}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transform transition-transform duration-300
          ${mobileMenu ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          {/* Sidebar links */}
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenu(!mobileMenu)}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/symptom-checker"
                onClick={() => setMobileMenu(!mobileMenu)}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Symptom Checker
              </Link>
            </li>
            <li>
              <Link
              onClick={() => setMobileMenu(!mobileMenu)}
                to="/health-profile"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Health Profile
              </Link>
            </li>
            <li>
              <Link
              onClick={() => setMobileMenu(!mobileMenu)}
                to="/medications"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Medications
              </Link>
            </li>
            <li>
              <Link
              onClick={() => setMobileMenu(!mobileMenu)}
                to="/Checkins"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                checkins
              </Link>
            </li>
            <li>
              <Link
              onClick={() => setMobileMenu(!mobileMenu)}
                to="/checkins"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Mental Health Crisis
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-0 sm:ml-64 pt-16 min-h-screen flex-1 flex items-start justify-center p-6">
        <main className="flex-1 overflow-y-auto flex justify-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
}