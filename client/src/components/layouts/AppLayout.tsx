import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-khc-light flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-khc-neutral text-khc-light py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">
                &copy; 2026 QSCostingPro. Professional Cost Estimation for Quantity Surveyors.
              </p>
            </div>
            <div className="text-sm">
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
