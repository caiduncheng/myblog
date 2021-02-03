import React from 'react'
import pixGithub from '../../content/images/PixelArt.png'

export default function Blurb() {  
  return (
    <section className="blurb">
      <div className="container">
        <div style={{ maxWidth: 450, margin: '0 auto' }} className="window">
          <div className="title-bar">
            <div className="title-bar-text">Welcome!</div>
            <div className="title-bar-controls">
              <button className="window-button" aria-label="Minimize" />
              <button className="window-button" aria-label="Maximize" />
              <button className="window-button" aria-label="Close" />
            </div>
          </div>

          <div className="window-body">
            <p className="window-main">I'm Caidc.</p>
            <div className="field-row" style={{ justifyContent: "center" }}>
              <button className="window-button">
                <span className="emoji"><img src={pixGithub} alt="Floppy Diskette" /></span>{' '}
                My GitHub
              </button>              
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
