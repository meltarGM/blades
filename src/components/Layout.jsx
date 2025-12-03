import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-layout" style={{ flexDirection: 'column' }}>
            <Navbar />
            <main className="main-content">
                <div className="content-container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
