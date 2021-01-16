import React from 'react'

export default function Header({ title, children }) {
  const [count, setCount] = React.useState(0);  
  return (
    <section className="blurb">
      <div className="container">
        <div style={{ width: 500 }} className="window">
          <div className="title-bar">
            <div className="title-bar-text">Welcome!</div>
            <div className="title-bar-controls">
              <button className="window-button" aria-label="Minimize" />
              <button className="window-button" aria-label="Maximize" />
              <button className="window-button" aria-label="Close" />
            </div>
          </div>

          <div className="window-body">
            <p style={{ textAlign: "center" }}>I'm Caidc.</p>
            <div className="field-row" style={{ justifyContent: "center" }}>
              <button className="window-button" onClick={() => setCount(count + 1)}>+</button>
              <button className="window-button" onClick={() => setCount(count - 1)}>-</button>
              <button className="window-button" onClick={() => setCount(0)}>0</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
  //   <header className="header">
  //   <div className="container">
  //     <h1>{title}</h1>
  //     <p className="subtitle">
  //       {children}
  //     </p>
  //   </div>
  // </header>
}
