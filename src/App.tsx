import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatrolPage from "./pages/PatrolPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import PatrolHistoryPage from "./pages/PatrolHistoryPage";
import PatrolDetailsPage from "./pages/PatrolDetailsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* 👇 Public pages (redirect if logged in) */}
        <Route
          path="/"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

        {/* 🔒 Protected route */}
        <Route
          path="/patrol"
          element={
            <ProtectedRoute>
              <PatrolPage />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Protected route */}
        <Route
          path="/patrol-history"
          element={
            <ProtectedRoute>
              <PatrolHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Protected route */}
        <Route
          path="/patrol/:id"
          element={
            <ProtectedRoute>
              <PatrolDetailsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
