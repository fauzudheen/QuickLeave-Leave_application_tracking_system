import { createSlice } from '@reduxjs/toolkit'

const initialState = { 
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null
 }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserSignIn(state, action) {
      state.isAuthenticated = true,
      state.accessToken = action.payload.access,
      state.refreshToken = action.payload.refresh,
      state.user = action.payload.user
    },
    setUserSignOut(state) {
      state.isAuthenticated = false
      state.accessToken = null
      state.refreshToken = null
      state.user = null
    }
  },
})

export const { setUserSignIn, setUserSignOut } = authSlice.actions
export default authSlice.reducer