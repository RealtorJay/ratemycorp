import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import CompaniesPage from './pages/CompaniesPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import SubmitReviewPage from './pages/SubmitReviewPage'
import DashboardPage from './pages/DashboardPage'
import EditReviewPage from './pages/EditReviewPage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage'
import PoliticiansPage from './pages/PoliticiansPage'
import PoliticianDetailPage from './pages/PoliticianDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/politicians" element={<PoliticiansPage />} />
          <Route path="/politicians/:slug" element={<PoliticianDetailPage />} />
          <Route path="/companies/:slug" element={<CompanyDetailPage />} />
          <Route path="/companies/:slug/forum" element={<ForumPage />} />
          <Route path="/companies/:slug/forum/:postId" element={<ForumPostPage />} />
          <Route
            path="/companies/:slug/review"
            element={<ProtectedRoute><SubmitReviewPage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/reviews/:reviewId/edit"
            element={<ProtectedRoute><EditReviewPage /></ProtectedRoute>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
