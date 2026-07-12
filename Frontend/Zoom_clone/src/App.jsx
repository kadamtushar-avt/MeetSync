import {Route,BrowserRouter as Router,Routes} from "react-router-dom"
import './App.css'
import LandingPage from './pages/landing'
import Authentication from "./pages/authentication"
import { AuthProvider } from "./contexts/AuthContext"
import VideoMeet from "./pages/VideoMeet"
import HomeComponent from "./pages/home"
import History from "./pages/history"

function App() {


  return (
    <>
      <Router>

        <AuthProvider>
          <Routes>
              <Route path='/' element={<LandingPage/>}/>
              <Route path="/auth" element={<Authentication/>}/>
              <Route path="/:url" element={<VideoMeet/>}/>
              <Route path="/history" element={<History/>} />
              <Route path="/home" element={<HomeComponent/>}/>
          </Routes>
        </AuthProvider>  
      </Router>
    </>
  )
}

export default App
