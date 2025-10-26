import Dashboard from './pages/Dashboard';
import FieldLogs from './pages/FieldLogs';
import TrainingModules from './pages/TrainingModules';
import PracticeLab from './pages/PracticeLab';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FieldLogs": FieldLogs,
    "TrainingModules": TrainingModules,
    "PracticeLab": PracticeLab,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};