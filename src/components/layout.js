import React from "react"
import Nav from './Nav'

import '../style.css'
import '../new-moon.css'

const Layout = ({ children }) => {
  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  )
}

export default Layout