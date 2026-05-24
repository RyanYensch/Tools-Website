import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import StarsBackground from './components/StarsBackground/StarsBackground'
import ToolsHome from './pages/ToolsHome/ToolsHome'
import ToolPage from './pages/ToolPage/ToolPage'
import Base64Tool from './pages/Base64Tool/Base64Tool'
import RegexTool from './pages/RegexTool/RegexTool'
import TextCompareTool from './pages/TextCompareTool/TextCompareTool'

function App() {
  return (
    <>
      <StarsBackground />

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ToolsHome />} />

          <Route path="/json" element={<ToolPage toolSlug="json" />} />
          <Route path="/base64" element={<Base64Tool />} />
          <Route path="/jwt" element={<ToolPage toolSlug="jwt" />} />
          <Route path="/regex" element={<RegexTool />} />
          <Route path="/timestamp" element={<ToolPage toolSlug="timestamp" />} />
          <Route path="/text-compare" element={<TextCompareTool />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App