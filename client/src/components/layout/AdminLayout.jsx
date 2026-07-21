import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { CopilotProvider } from '../copilot/CopilotContext';
import CopilotWidget from '../copilot/CopilotWidget';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <CopilotProvider>
      <div className="flex h-screen bg-surface-50 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar onMenuClick={toggleSidebar} />
          
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
        <CopilotWidget />
      </div>
    </CopilotProvider>
  );
};

export default AdminLayout;
