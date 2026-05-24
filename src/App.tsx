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
import JsonTool from './pages/JsonTool/JsonTool'
import UrlTool from './pages/UrlTool/UrlTool'
import MarkdownTool from './pages/MarkdownTool/MarkdownTool'
import ColourTool from './pages/ColourTool/ColourTool'

function App() {
  return (
    <>
      <StarsBackground />

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ToolsHome />} />

          <Route path="/json" element={<JsonTool />} />
          <Route path="/base64" element={<Base64Tool />} />
          <Route path="/jwt" element={<JwtTool />} />
          <Route path="/regex" element={<RegexTool />} />
          <Route path="/timestamp" element={<TimestampTool />} />
          <Route path="/text-compare" element={<TextCompareTool />} />
          <Route path="/sqli-tester" element={<SqliTesterTool />} />
          <Route path="/url" element={<UrlTool />} />
          <Route path="/markdown" element={<MarkdownTool />} />
          <Route path="/csp" element={<ToolPage toolSlug="csp" />} />
          <Route path="/colour" element={<ColourTool />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App