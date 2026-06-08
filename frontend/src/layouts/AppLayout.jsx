import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import Footer from "../components/footer/Footer";

const AppLayout = () => {
  return (
    <div className="h-screen flex bg-slate-950 text-white">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Topbar />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

        <Footer />

      </div>

    </div>
  );
};

export default AppLayout;