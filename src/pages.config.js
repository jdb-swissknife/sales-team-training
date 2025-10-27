import Dashboard from './pages/Dashboard';
import FieldLogs from './pages/FieldLogs';
import TrainingModules from './pages/TrainingModules';
import PracticeLab from './pages/PracticeLab';
import ObjectionLibrary from './pages/ObjectionLibrary';
import MyProgress from './pages/MyProgress';
import CoachReview from './pages/CoachReview';
import Analytics from './pages/Analytics';
import ModuleDetail from './pages/ModuleDetail';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FieldLogs": FieldLogs,
    "TrainingModules": TrainingModules,
    "PracticeLab": PracticeLab,
    "ObjectionLibrary": ObjectionLibrary,
    "MyProgress": MyProgress,
    "CoachReview": CoachReview,
    "Analytics": Analytics,
    "ModuleDetail": ModuleDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};