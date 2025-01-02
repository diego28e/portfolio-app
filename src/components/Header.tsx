import { Code2, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { logout } from "../lib/auth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  /**
   * Remove a cookie from all potential domain variations:
   *   - Exactly window.location.hostname (e.g. portfolio-manager-app.netlify.app)
   *   - Dot-prefixed .portfolio-manager-app.netlify.app
   *   - The top-level .netlify.app if applicable
   */
  function removeCookie(cookieName: string) {
    const hostname = window.location.hostname;
    // e.g. "portfolio-manager-app.netlify.app"
    const domainParts = hostname.split(".");
    const domainsToTry = new Set<string>();

    // 1) Exact hostname
    domainsToTry.add(hostname);

    // 2) Dot-prefixed hostname
    domainsToTry.add(`.${hostname}`);

    // 3) If the hostname has more than two parts, also try top-level
    //    (e.g. ".netlify.app")
    if (domainParts.length > 2) {
      const tld = domainParts.slice(-2).join(".");
      domainsToTry.add(`.${tld}`);
    }

    // Expire the cookie for each domain variation
    for (const domain of domainsToTry) {
      document.cookie = `${cookieName}=; 
        expires=Thu, 01 Jan 1970 00:00:00 GMT; 
        path=/; 
        domain=${domain};`;
    }
  }

  /**
   * Removes *only* the cookies we care about by name.
   * If you want to remove *all* cookies for debugging,
   * you could loop over `document.cookie.split('; ')`
   * and expire them all.
   */
  function removeTargetedCookies() {
    const cookieNames = [
      "XSRF-TOKEN",
      "cognito",
      "csrf-state",
      "csrf-state-legacy",
      "lang",
    ];
    cookieNames.forEach(removeCookie);
  }

  const handleLogout = async () => {
    try {
      // 1) Remove user from OIDC context so react-oidc-context won't re-init
      await auth.removeUser();

      // 2) Remove the "code" param from the current URL, if it exists
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("code")) {
        urlParams.delete("code");
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }

      // 3) Clear OIDC data from local/session storage
      const storageKeys = Object.keys(localStorage).concat(
        Object.keys(sessionStorage)
      );
      storageKeys.forEach((key) => {
        if (key.includes("oidc.user:")) {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        }
      });

      // Also remove any custom key like "id_token" if you have it
      localStorage.removeItem("id_token");
      // For safety, clear everything from session
      sessionStorage.clear();

      // 4) Explicitly remove the 5 known cookies on your domain
      removeTargetedCookies();

      // 5) Navigate home
      navigate("/");

      // 6) Finally call your existing function that hits the Cognito logout endpoint
      logout();
    } catch (error) {
      console.error("Logout error:", error);

      // Fallback: clear all storage & cookies, then redirect home
      localStorage.clear();
      sessionStorage.clear();
      removeTargetedCookies();
      navigate("/");
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Diego Espinosa
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex sm:space-x-8 sm:items-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Portfolio
            </Link>
            <Link
              to="/manage"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Manage Projects
            </Link>
            {auth.isAuthenticated && location.pathname === "/manage" && (
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/manage"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Projects
            </Link>
            {auth.isAuthenticated && location.pathname === "/manage" && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
