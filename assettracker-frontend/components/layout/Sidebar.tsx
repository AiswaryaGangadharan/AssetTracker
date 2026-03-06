"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

type SidebarProps = {
  role: "admin" | "employee";
};

export default function Sidebar({ role }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-64 h-screen flex flex-col bg-background border-r p-5 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-6 text-primary">AssetTracker</h2>

      <ul className="space-y-3 flex-grow">
        <li className="hover:text-blue-500 cursor-pointer">Dashboard</li>
        <li className="hover:text-blue-500 cursor-pointer">Assets</li>
        <li className="hover:text-blue-500 cursor-pointer">Employees</li>

        {/* This part only shows if you are an ADMIN */}
        {role === "admin" && (
          <div className="pt-4 border-t mt-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase">Admin Tools</p>
            <li className="text-red-500 hover:font-bold cursor-pointer">Create Asset</li>
            <li className="text-red-500 hover:font-bold cursor-pointer">Delete Asset</li>
          </div>
        )}
      </ul>

      {/* THEME TOGGLE BUTTON (For your screenshots!) */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mt-auto p-2 border rounded-md flex items-center justify-center gap-2 hover:bg-accent"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
      </button>
    </div>
  );
}