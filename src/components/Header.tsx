import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { Button } from "@/components/ui/Button";

export function Header() {
    const { user, signOut } = useAuth();
    const [open, setOpen] = useState(false);

    const linkStyle = ({ isActive }: { isActive: boolean }) => ["px-3 py-1 rounded transition text-app-on-accent relative", isActive ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full" : "hover:bg-app-on-accent/20"].join(" ");
    const toggleMenu = () => setOpen((prev) => !prev);
    const closeMenu = () => setOpen(false);

    return (
        <header className="sticky top-0 z-20 bg-app-accent text-app-on-accent shadow-md">
            <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
                {/* Logo */}
                <Link
                    to="/"
                    className="font-semibold tracking-tight">
                    <img
                        src="/elva11.svg"
                        alt=""
                        aria-hidden="true"
                        className="w-24"
                    />
                </Link>

                {/* Desktop nav */}
                <div className="ml-auto hidden md:flex items-center gap-3">
                    {/* Non loggato */}
                    {!user && (
                        <>
                            <NavLink
                                to="/"
                                className={linkStyle}>
                                Home
                            </NavLink>
                            <NavLink
                                to="/login"
                                className={linkStyle}>
                                Login
                            </NavLink>
                        </>
                    )}

                    {/* Loggato */}
                    {user && (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={linkStyle}>
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/customers"
                                className={linkStyle}>
                                Customers
                            </NavLink>
                            <NavLink
                                to="/projects"
                                className={linkStyle}>
                                Projects
                            </NavLink>
                            <Button
                                onClick={signOut}
                                variant="secondary"
                                size="md">
                                Logout
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    className="ml-auto md:hidden inline-flex items-center justify-center rounded p-2 ring-1 ring-app-on-accent/20 hover:bg-app-on-accent/20 transition"
                    aria-controls="mobile-menu"
                    aria-expanded={open}
                    onClick={toggleMenu}>
                    <span className="sr-only">Apri menù</span>
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        aria-hidden="true">
                        <path
                            d="M4 7h16M4 12h16M4 17h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </nav>

            {/* Mobile menu */}
            <div
                id="mobile-menu"
                className={["md:hidden overflow-hidden transition-[max-height,opacity] duration-200", open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"].join(" ")}>
                <div className="mx-2 mb-3 rounded-lg border border-white/20 bg-app-accent shadow-sm">
                    <ul className="py-2 text-app-on-accent">
                        {/* Non loggato */}
                        {!user && (
                            <>
                                <li>
                                    <NavLink
                                        to="/"
                                        onClick={closeMenu}
                                        className={linkStyle}>
                                        Home
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/login"
                                        onClick={closeMenu}
                                        className={linkStyle}>
                                        Login
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* Loggato */}
                        {user && (
                            <>
                                <li>
                                    <NavLink
                                        to="/dashboard"
                                        onClick={closeMenu}
                                        className={linkStyle}>
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/customers"
                                        onClick={closeMenu}
                                        className={linkStyle}>
                                        Customers
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/projects"
                                        onClick={closeMenu}
                                        className={linkStyle}>
                                        Projects
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="#"
                                        className={linkStyle}
                                        onClick={() => {
                                            closeMenu();
                                            signOut();
                                        }}>
                                        Logout
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </header>
    );
}
