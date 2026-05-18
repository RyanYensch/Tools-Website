import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import StarsBackground from './components/StarsBackground/StarsBackground'
import ToolsHome from './pages/ToolsHome/ToolsHome'
import ToolPage from './pages/ToolPage/ToolPage'

function App() {
  return (
    <>
      <StarsBackground />

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ToolsHome />} />

          <Route path="/json" element={<ToolPage toolSlug="json" />} />
          <Route path="/base64" element={<ToolPage toolSlug="base64" />} />
          <Route path="/jwt" element={<ToolPage toolSlug="jwt" />} />
          <Route path="/regex" element={<ToolPage toolSlug="regex" />} />
          <Route path="/timestamp" element={<ToolPage toolSlug="timestamp" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App