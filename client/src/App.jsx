import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Tours from './pages/Tours';
import Tour from './pages/Tour';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import MyTours from './pages/MyTours';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Billing from './pages/Billing';
import NotFound from './pages/NotFound';
import ManageTours from './pages/ManageTours';
import TourForm from './pages/TourForm';
import TourStats from './pages/TourStats';
import MyReviews from './pages/MyReviews';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="tours" element={<Tours />} />
        <Route path="tour/:slug" element={<Tour />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route
          path="me"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-tours"
          element={
            <ProtectedRoute>
              <MyTours />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-reviews"
          element={
            <ProtectedRoute>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout/:tourId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout-success"
          element={
            <ProtectedRoute>
              <CheckoutSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage-tours"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTours />
            </ProtectedRoute>
          }
        />
        <Route
          path="tours/new"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead-guide']}>
              <TourForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="tours/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead-guide']}>
              <TourForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="stats"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead-guide', 'guide']}>
              <TourStats />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

