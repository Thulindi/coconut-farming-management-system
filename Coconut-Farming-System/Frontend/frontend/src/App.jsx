import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import OfficerDashboard from './pages/dashboard/OfficerDashboard';
import Profile from './pages/dashboard/Profile';

// Plantation pages
import LandList from './pages/plantation/LandList';
import LandForm from './pages/plantation/LandForm';
import LandDetails from './pages/plantation/LandDetails';
import Fertilizing from './pages/plantation/Fertilizing';
import Harvest from './pages/plantation/Harvest';
import FieldVisits from './pages/plantation/FieldVisits';

// Financial pages
import FinancialDashboard from './pages/financial/FinancialDashboard';
import FinancialRecords from './pages/financial/FinancialRecords';

// Inventory pages
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import InventoryItems from './pages/inventory/InventoryItems';
import Suppliers from './pages/inventory/Suppliers';
import Purchases from './pages/inventory/Purchases';
import Usage from './pages/inventory/Usage';
import LowStock from './pages/inventory/LowStock';

// Labor pages
import LaborDashboard from './pages/labor/LaborDashboard';
import Workers from './pages/labor/Workers';
import Tasks from './pages/labor/Tasks';
import WorkLogs from './pages/labor/WorkLogs';
import TaskCategories from './pages/labor/TaskCategories';
import LaborAnalytics from './pages/labor/LaborAnalytics';

// Community pages
import CommunityDashboard from './pages/community/CommunityDashboard';
import Articles from './pages/community/Articles';
import ArticleDetail from './pages/community/ArticleDetail';
import ArticleForm from './pages/community/ArticleForm';
import News from './pages/community/News';

// Admin pages
import UserManagement from './pages/dashboard/UserManagement';
import CommunityManagement from './pages/admin/CommunityManagement';
import LandOversight from './pages/admin/LandOversight';
import OfficerLandOversight from './pages/admin/OfficerLandOversight';
import AdminReports from './pages/dashboard/AdminReports';

// Market pages
import FarmIntelligence from './pages/market/FarmIntelligence';

// Disease Detection
import DiseaseDetection from './pages/disease/DiseaseDetection';

function App() {
  const { isAuthenticated, getPrimaryRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  const DashboardRouter = () => {
    const role = getPrimaryRole();
    switch (role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'OFFICER':
        return <OfficerDashboard />;
      case 'FARMER':
      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!isAuthenticated ? <LandingPage initialModal="login" /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <LandingPage initialModal="register" /> : <Navigate to="/dashboard" />} />
      <Route path="/email-verified" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<LandingPage initialModal="forgotPassword" />} />
      <Route path="/reset-password" element={<LandingPage initialModal="resetPassword" />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/profile" element={<Profile />} />

                {/* Plantation */}
                <Route path="/plantation" element={<Navigate to="/plantation/lands" />} />
                <Route path="/plantation/lands" element={<LandList />} />
                <Route path="/plantation/lands/new" element={<LandForm />} />
                <Route path="/plantation/lands/:id" element={<LandDetails />} />
                <Route path="/plantation/lands/:id/edit" element={<LandForm />} />
                <Route path="/plantation/lands/:id/fertilizing" element={<Fertilizing />} />
                <Route path="/plantation/lands/:id/harvest" element={<Harvest />} />
                <Route path="/plantation/fertilizing" element={<LandList showFertilizing />} />
                <Route path="/plantation/harvest" element={<LandList showHarvest />} />
                <Route path="/plantation/field-visits" element={<FieldVisits />} />

                {/* Financial */}
                <Route path="/financial" element={<FinancialDashboard />} />
                <Route path="/financial/records" element={<FinancialRecords />} />

                {/* Inventory */}
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <InventoryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/items"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <InventoryItems />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/suppliers"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <Suppliers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/purchases"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <Purchases />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/usage"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <Usage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/low-stock"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <LowStock />
                    </ProtectedRoute>
                  }
                />

                {/* Labor */}
                <Route
                  path="/labor"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <LaborDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labor/workers"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <Workers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labor/tasks"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labor/work-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <WorkLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labor/categories"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <TaskCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labor/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <LaborAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* Community */}
                <Route path="/community" element={<CommunityDashboard />} />
                <Route path="/community/articles" element={<Articles />} />
                <Route path="/community/articles/new" element={<ArticleForm />} />
                <Route path="/community/articles/:id" element={<ArticleDetail />} />
                <Route path="/community/articles/:id/edit" element={<ArticleForm />} />
                <Route path="/community/news" element={<News />} />

                {/* Farm Intelligence */}
                <Route
                  path="/farm-intelligence"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FARMER']}>
                      <FarmIntelligence />
                    </ProtectedRoute>
                  }
                />

                {/* AI Disease Detection */}
                <Route
                  path="/ai-detection"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'FARMER']}>
                      <DiseaseDetection />
                    </ProtectedRoute>
                  }
                />

                {/* Admin */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/community"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <CommunityManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/lands"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <LandOversight />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/officer/lands"
                  element={
                    <ProtectedRoute allowedRoles={['OFFICER']}>
                      <OfficerLandOversight />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
