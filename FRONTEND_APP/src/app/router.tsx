import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AuthLayout, DashboardLayout } from '../layouts';
import ProtectedRoute from '../components/atoms/ProtectedRoute';
import PublicRoute from '../components/atoms/PublicRoute';
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import CallbackPage from '../pages/auth/CallbackPage';
import SelectNichePage from '../pages/onboarding/SelectNichePage';
import ConnectSocialsPage from '../pages/onboarding/ConnectSocialsPage';
import UploadAvatarPage from '../pages/onboarding/UploadAvatarPage';
import DashboardHome from '../pages/dashboard/DashboardHome';
import SocialsPage from '../pages/dashboard/SocialsPage';
import ContentPage from '../pages/dashboard/ContentPage';
import EarningsPage from '../pages/dashboard/EarningsPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';

export function AppRouter() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
            </Route>

            <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-otp" element={<VerifyOtpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/auth/linkedin/callback" element={<CallbackPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<PublicLayout />}>
                    <Route path="niche" element={<SelectNichePage />} />
                    <Route path="socials" element={<ConnectSocialsPage />} />
                    <Route path="avatar" element={<UploadAvatarPage />} />
                </Route>

                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="socials" element={<SocialsPage />} />
                    <Route path="content" element={<ContentPage />} />
                    <Route path="earnings" element={<EarningsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
