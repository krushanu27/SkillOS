import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";
import SkillPage from "../pages/SkillPage";

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
            </Routes>
        </BrowserRouter>
    );
}