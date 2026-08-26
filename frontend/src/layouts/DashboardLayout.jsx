import Sidebar from "../components/common/sidebar";
import Topbar from "../components/common/topbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;