
import HomeScreen from "./pages/hospedagens/home/home"
import RegistrationForm from "./pages/hospedagens/register/register"
import LoginScreen from "./pages/hospedagens/login/login"
import HomePage from "./pages/hospedagens/home-page/home-page"
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import './App.css'

export default function App(){

  return(
      <div className="App">
        <Router>
          <Routes>

            <Route path='/' element={<HomeScreen/>}/>
            <Route path='/register' element={<RegistrationForm/>}/>
            <Route path='/login' element={<LoginScreen/>}/>
            <Route path='/home' element={<HomePage/>}/>

          </Routes>
        </Router>
      </div>
  )
}  
