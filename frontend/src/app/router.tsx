import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";
import SkillPage from "../pages/SkillPage";
import HistoryPage from "../pages/HistoryPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<DashboardPage />}
                />

                <Route
                    path="/skill/:id"
                    element={<SkillPage />}
                />

                <Route
                    path="/history"
                    element={<HistoryPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}