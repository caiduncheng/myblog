import React from 'react'

export default function Header ({title, children}) {
    return (
        <header>
            <div className="container">
                <h1>{title}</h1>
                <p className="subtitle">
                    {children}
                </p>
            </div>
        </header>
    )
}