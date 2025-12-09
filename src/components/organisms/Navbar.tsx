import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Navbar as NavbarMolecule } from "../molecules";
import { useAuth } from "@/context/AuthContext";

export const Navbar = ({ hideNavigation = false }: { hideNavigation?: boolean }) => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { id: "beranda", label: "Beranda", href: "/" },
    { id: "tentang", label: "Tentang", href: "/about" },
    { id: "silabus", label: "Silabus", href: "/sylabus" },
    { id: "galeri", label: "Galeri", href: "/galeri" },
    { id: "bantuan", label: "Bantuan", href: "/contact" },
  ];

  const handleNavClick = (id: string) => {
    const item = navItems.find((i) => i.id === id);
    if (item?.href) {
      router.push(item.href);
    }
  };

  // Determine active item based on current path
  const activeItem = navItems.find(
    (item) =>
      item.href === router.pathname ||
      (item.href !== "/" && router.pathname.startsWith(item.href || ""))
  );

  return (
    <NavbarMolecule
      logo={
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/assets/LPK-White.png"
            alt="LPK Merdeka Logo"
            width={32}
            height={32}
            className="object-contain" // ensure logo doesn't stretch
          />
        </div>
      }
      activeId={activeItem?.id || "beranda"}
      navItems={navItems}
      onNavClick={handleNavClick}
      onLoginClick={() => router.push("/auth/login")}
      onRegisterClick={() => router.push("/auth/register")}
      isAuthenticated={isAuthenticated}
      user={user}
      onDashboardClick={() => router.push("/dashboard")}
      onLogoutClick={logout}
      hideNavigation={hideNavigation}
    />
  );
};