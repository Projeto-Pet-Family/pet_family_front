
import HomeScreen from "./pages/hospedagens/home/home"
import RegistrationForm from "./pages/hospedagens/register/register"
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import './App.css'

export default function App(){

  return(
      <div className="App">
        <Router>
          <Routes>

            <Route path='/' element={<HomeScreen/>}/>
            <Route path='/register' element={<RegistrationForm/>}/>

          </Routes>
        </Router>
      </div>
  )
}  
