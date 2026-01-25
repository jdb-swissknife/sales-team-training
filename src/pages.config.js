import AdminUsers from './pages/AdminUsers';
import Analytics from './pages/Analytics';
import CoachReview from './pages/CoachReview';
import Dashboard from './pages/Dashboard';
import FieldLogs from './pages/FieldLogs';
import Home from './pages/Home';
import ModuleDetail from './pages/ModuleDetail';
import MyProgress from './pages/MyProgress';
import ObjectionLibrary from './pages/ObjectionLibrary';
import PracticeLab from './pages/PracticeLab';
import TrainingModules from './pages/TrainingModules';
import PlatformDashboard from './pages/PlatformDashboard';
import CompanyDetail from './pages/CompanyDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminUsers": AdminUsers,
    "Analytics": Analytics,
    "CoachReview": CoachReview,
    "Dashboard": Dashboard,
    "FieldLogs": FieldLogs,
    "Home": Home,
    "ModuleDetail": ModuleDetail,
    "MyProgress": MyProgress,
    "ObjectionLibrary": ObjectionLibrary,
    "PracticeLab": PracticeLab,
    "TrainingModules": TrainingModules,
    "PlatformDashboard": PlatformDashboard,
    "CompanyDetail": CompanyDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};