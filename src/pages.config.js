/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminUsers from './pages/AdminUsers';
import Analytics from './pages/Analytics';
import CoachReview from './pages/CoachReview';
import CompanyDetail from './pages/CompanyDetail';
import ContentLibrary from './pages/ContentLibrary';
import Dashboard from './pages/Dashboard';
import FieldLogs from './pages/FieldLogs';
import Home from './pages/Home';
import ModuleDetail from './pages/ModuleDetail';
import MyProgress from './pages/MyProgress';
import ObjectionLibrary from './pages/ObjectionLibrary';
import PlatformDashboard from './pages/PlatformDashboard';
import PracticeLab from './pages/PracticeLab';
import TrainingModules from './pages/TrainingModules';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminUsers": AdminUsers,
    "Analytics": Analytics,
    "CoachReview": CoachReview,
    "CompanyDetail": CompanyDetail,
    "ContentLibrary": ContentLibrary,
    "Dashboard": Dashboard,
    "FieldLogs": FieldLogs,
    "Home": Home,
    "ModuleDetail": ModuleDetail,
    "MyProgress": MyProgress,
    "ObjectionLibrary": ObjectionLibrary,
    "PlatformDashboard": PlatformDashboard,
    "PracticeLab": PracticeLab,
    "TrainingModules": TrainingModules,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};