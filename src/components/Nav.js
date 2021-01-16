import React from 'react'
import { Link } from 'gatsby'
// import floppy from '../../content/images/floppylogo.png'
import htmlSymbol from '../../content/images/html.png'

export default function Nav() {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="flex">
          <div>
            <Link to="/" className="brand">
              <span className="emoji">
                <img src={htmlSymbol} alt="Floppy Diskette" />
              </span>{' '}
              Caidc
            </Link>
          </div>
          <div className="flex">
            <Link to="/blog">文章</Link>
            <Link to="/guides">分类</Link>
            <Link to="/me">关于</Link>
            <button
              id="dark-mode-button"             
            >
              {typeof window !== 'undefined' &&
              localStorage.getItem('theme') === 'dark'
                ? '☀️'
                : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
