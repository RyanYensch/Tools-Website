import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import StarsBackground from './components/StarsBackground/StarsBackground'
import ToolsHome from './pages/ToolsHome/ToolsHome'
import ToolPage from './pages/ToolPage/ToolPage'
import Base64Tool from './pages/Base64Tool/Base64Tool'
import RegexTool from './pages/RegexTool/RegexTool'
import TextCompareTool from './pages/TextCompareTool/TextCompareTool'
import SqliTesterTool from './pages/SqliTesterTool/SqliTesterTool'
import JwtTool from './pages/JwtTool/JwtTool'
import TimestampTool from './pages/TimestampTool/TimestampTool'

function App() {
  return (
    <>
      <StarsBackground />

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ToolsHome />} />

          <Route path="/json" element={<ToolPage toolSlug="json" />} />
          <Route path="/base64" element={<Base64Tool />} />
          <Route path="/jwt" element={<JwtTool />} />
          <Route path="/regex" element={<RegexTool />} />
          <Route path="/timestamp" element={<TimestampTool />} />
          <Route path="/text-compare" element={<TextCompareTool />} />
          <Route path="/sqli-tester" element={<SqliTesterTool />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App