import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Guests from "./pages/Guests";
import GuestsManage from "./pages/GuestsManage";
import AddGuest from "./pages/AddGuest";
import GuestDetails from "./pages/GuestDetails";
import Scanner from "./pages/Scanner";
import Tables from "./pages/Tables";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProfileStats from "./pages/ProfileStats";
import Admins from "./pages/Admins";

import ProtectedRoute from "./components/ProtectedRoute";

function Protect({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <Protect>
              <Dashboard />
            </Protect>
          }
        />

        {/* Invités */}
        <Route
          path="/guests"
          element={
            <Protect>
              <Guests />
            </Protect>
          }
        />

        <Route
          path="/guests/manage"
          element={
            <Protect>
              <GuestsManage />
            </Protect>
          }
        />

        <Route
          path="/guests/new"
          element={
            <Protect>
              <AddGuest />
            </Protect>
          }
        />

        <Route
          path="/guests/:slug"
          element={
            <Protect>
              <GuestDetails />
            </Protect>
          }
        />

        {/* Scanner */}
        <Route
          path="/scanner"
          element={
            <Protect>
              <Scanner />
            </Protect>
          }
        />

        {/* Tables */}
        <Route
          path="/tables"
          element={
            <Protect>
              <Tables />
            </Protect>
          }
        />

        {/* Paramètres */}
        <Route
          path="/settings"
          element={
            <Protect>
              <Settings />
            </Protect>
          }
        />

        {/* Profil */}
        <Route
          path="/profile"
          element={
            <Protect>
              <Profile />
            </Protect>
          }
        />

        {/* KPI / Statistiques */}
        <Route
          path="/profile/stats"
          element={
            <Protect>
              <ProfileStats />
            </Protect>
          }
        />

        {/* Super Admin */}
        <Route
          path="/profile/admins"
          element={
            <Protect>
              <Admins />
            </Protect>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-[#F7F1E6]">
              <div className="rounded-[36px] bg-white p-10 text-center shadow-xl">
                <h1 className="text-7xl font-black text-[#B88900]">
                  404
                </h1>

                <p className="mt-4 text-2xl font-black text-[#111827]">
                  Page introuvable
                </p>

                <p className="mt-2 text-gray-500">
                  Cette page n'existe pas ou a été déplacée.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;