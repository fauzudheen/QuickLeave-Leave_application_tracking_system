import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import NavbarLayout from './pages/NavbarLayout'
import UserProtectedRoutes from './utils/route layouts/UserProtectedRoutes'
import UserReverseProtectedRoutes from './utils/route layouts/UserReverseProtectedRoutes'
import EmployeePage from './pages/EmployeePage'
import ManagerPage from './pages/ManagerPage'

function App() {

  return (
    <Routes>
      <Route element={<UserProtectedRoutes />}>
        <Route element={<NavbarLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/manager" element={<ManagerPage />} />
        </Route>
      </Route>

      <Route element={<UserReverseProtectedRoutes />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Route>
    </Routes>
  )
}

export default App
