import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Admin/Sidebar";
import Dashboard from "./Admin/Dashboard";
import Event from "./Admin/Event";
import Emcee from "./Admin/Emcee";
import Shop from "./Admin/Shop";
import Login from "./Admin/Login";
import CreateTix from "./Admin/CreateTix";
import TixMonitor from "./Admin/TixMonitor";
import Playlist from "./Admin/Playlist";
import ShopManager from "./Admin/ShopManager";

function PrivateLayout({ isLoggedIn, onLogout }) {
  return isLoggedIn ? (
    <div className="flex">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1">
        <Outlet /> {/* This renders the nested routes */}
      </div>
    </div>
  ) : (
    <Navigate to="/admin" replace />
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginHandler = () => setIsLoggedIn(true);
  const logoutHandler = () => setIsLoggedIn(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="/admin">
          <Route index element={isLoggedIn ? <Navigate to="/admin/dashboard" replace /> : <Login loginHandler={loginHandler} />} />

          <Route element={<PrivateLayout isLoggedIn={isLoggedIn} onLogout={logoutHandler} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="event" element={<Event />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shopmanager" element={<ShopManager />} />
            <Route path="emcee" element={<Emcee />} />
            <Route path="createtix" element={<CreateTix />} />
            <Route path="tixmonitor" element={<TixMonitor />} />
            <Route path="playlist" element={<Playlist />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
