import RegistrationForm from "./pages/hospedagens/register/register"
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'

export default function App(){

  return(
      <div className="App">
        <Router>
          <Routes>
  
            <Route path='/' element={<RegistrationForm/>}/>
           
  
          </Routes>
        </Router>
      </div>
  )
}  
