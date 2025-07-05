// frontend/src/components/Footer.js
import React, { useState, useEffect } from 'react';
import { FaYoutube, FaFacebook, FaLinkedin, FaInstagram, FaChevronUp } from 'react-icons/fa';
import logo from '../logo-dhl-style.png'; // Logoyu tekrar kullanacağız

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Sayfa kaydırıldığında butonu göster/gizle
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Sayfanın en üstüne yumuşak bir şekilde kaydır
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h4>Quick Links</h4>
                    <a href="#">Customer Service</a>
                    <a href="#">Customer Portal Logins</a>
                    <a href="#">Digital Partners and Integrations</a>
                    <a href="#">Developer Portal</a>
                </div>
                <div className="footer-column">
                    <h4>Our Divisions</h4>
                    <a href="#">DHL Express</a>
                    <a href="#">DHL Global Forwarding</a>
                    <a href="#">DHL Freight</a>
                    <a href="#">Other Global Divisions</a>
                </div>
                <div className="footer-column">
                    <h4>Industry Sectors</h4>
                    <a href="#">Auto-Mobility</a>
                    <a href="#">Chemicals</a>
                    <a href="#">Technology</a>
                    <a href="#">Retail</a>
                </div>
                <div className="footer-column">
                    <h4>Company Information</h4>
                    <a href="#">About MS-CARGO</a>
                    <a href="#">Press</a>
                    <a href="#">Careers</a>
                    <a href="#">Investors</a>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="footer-bottom-left">
                    <img src={logo} alt="MS-Cargo Group Logo" className="footer-logo" />
                    <div className="legal-links">
                        <a href="#">Fraud Awareness</a>
                        <a href="#">Legal Notice</a>
                        <a href="#">Terms of Use</a>
                        <a href="#">Privacy Notice</a>
                    </div>
                </div>
                <div className="footer-bottom-right">
                    <span>Follow Us</span>
                    <div className="social-icons">
                        <a href="#"><FaYoutube /></a>
                        <a href="#"><FaFacebook /></a>
                        <a href="#"><FaLinkedin /></a>
                        <a href="#"><FaInstagram /></a>
                    </div>
                </div>
            </div>
            {isVisible && (
                <button onClick={scrollToTop} className="scroll-to-top">
                    <FaChevronUp />
                </button>
            )}
        </footer>
    );
};

export default Footer;