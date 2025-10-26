import Dashboard from './pages/Dashboard';
import FieldLogs from './pages/FieldLogs';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FieldLogs": FieldLogs,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};