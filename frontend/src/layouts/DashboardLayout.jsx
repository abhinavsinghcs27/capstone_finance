import Sidebar from "../components/common/sidebar";
import Topbar from "../components/common/topbar";
import Footer from "../components/common/footer";
import { SidebarProvider } from "../context/SidebarContext";

function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />

          <main className="flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col">
              {/* Main page content */}
              <div className="flex-1 px-6 py-6 md:px-8 lg:px-10">
                {children}
              </div>

              {/* Footer */}
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;