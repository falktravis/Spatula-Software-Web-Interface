import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { app } from './realm'

export default function ProtectedRoutes() {
    const currentUser = app.currentUser;

    return (
        currentUser ? <Outlet/> : <Navigate to='/login'/>
      )
}
