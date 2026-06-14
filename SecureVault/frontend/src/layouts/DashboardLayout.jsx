import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto min-h-[calc(100vh-65px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
