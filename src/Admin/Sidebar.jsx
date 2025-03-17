import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase/firebase";
import logo from "../assets/Pictures/translogo.png";
import { LayoutDashboard, Calendar, ShoppingCart, Mic, ShirtIcon, LogOut, TicketIcon, Monitor,ListMusic } from "lucide-react";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      onLogout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 z-50 bg-black text-white flex flex-col items-center py-6 overflow-y-auto shadow-lg">

      {/* Logo */}
      <div className="mb-6">
        <img src={logo} alt="Rapollo Logo" className="w-24" />
      </div>
      
      <hr className="w-full border-gray-700 mb-6" />
      
      {/* Navigation */}
      <nav className="w-full flex flex-col space-y-2 px-4">
        <NavLink to="/admin/Dashboard" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <LayoutDashboard className="mr-3" size={20} /> Dashboard
        </NavLink>
        <NavLink to="/admin/Event" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <Calendar className="mr-3" size={20} /> Events
        </NavLink>
        <NavLink to="/admin/Shop" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <ShoppingCart className="mr-3" size={20} /> Shop
        </NavLink>
        <NavLink to="/admin/ShopManager" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <ShirtIcon className="mr-3" size={20} /> Shop Orders
        </NavLink>
        <NavLink to="/admin/Emcee" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <Mic className="mr-3" size={20} /> Emcees
        </NavLink>
        <NavLink to="/admin/CreateTix" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <TicketIcon className="mr-3" size={20} /> Create Ticket
        </NavLink>
        <NavLink to="/admin/TixMonitor" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <Monitor className="mr-3" size={20} /> Manage Tickets
        </NavLink>
        <NavLink to="/admin/Playlist" className={({ isActive }) => isActive ? "flex items-center px-4 py-2 bg-gray-700 rounded-lg" : "flex items-center px-4 py-2 hover:bg-gray-700 rounded-lg"}>
          <ListMusic className="mr-3" size={20} /> Playlists
        </NavLink>
      </nav>
      {/* Logout */}
      <div className="mt-auto mb-4">
      <button 
        onClick={handleLogOut} 
        className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 ease-in-out bg-zinc-900 hover:bg-red-700 transform hover:scale-105"
        >
          <LogOut className="mr-3" size={20} /> Logout
        </button>
      </div>

      <p className="text-xs text-gray-500">© 2025 Rapollo. All Rights Reserved.</p>
    </div>
  );
};

export default Sidebar;