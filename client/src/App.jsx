import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import NavbarLayout from './pages/NavbarLayout'

function App() {

  return (
    <Routes>
      <Route element={<NavbarLayout />}>
        <Route path="/" element={<Home/>} />
      </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
    </Routes>
  )
}

export default App
