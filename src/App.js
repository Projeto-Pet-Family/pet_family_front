import LoginScreen from "./pages/hospedagens/login/login"
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'

export default function App(){

  return(
      <div className="App">
        <Router>
          <Routes>
  
            <Route path='/' element={<LoginScreen/>}/>
           
  
          </Routes>
        </Router>
      </div>
  )
}  
