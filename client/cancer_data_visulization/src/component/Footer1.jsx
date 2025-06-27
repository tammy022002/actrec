    import { Link } from "react-router-dom"
    import { Facebook, Twitter, Instagram, YouTube, Email, Phone, LocationOn } from "@mui/icons-material"
    import "../assets/Footer1.css"

    function Footer1() {
        return (
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-section">
                            <Link to="/" className="logo-link">
                                <img
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/actrec-logo.jpg-PZD4ydR9NjqyuY1PC9bxMjrdshQ8D0.jpeg"
                                    alt="ACTREC Logo"
                                    className="logo-image"
                                />
                                <span className="logo-text">ACTREC</span>
                            </Link>
                            <p className="footer-description">Advanced Centre for Treatment, Research and Education in Cancer</p>
                            <div className="social-links">
                                <Link to="#" className="social-link">
                                    <Facebook />
                                    <span className="sr-only">Facebook</span>
                                </Link>
                                <Link to="#" className="social-link">
                                    <Twitter />
                                    <span className="sr-only">Twitter</span>
                                </Link>
                                <Link to="#" className="social-link">
                                    <Instagram />
                                    <span className="sr-only">Instagram</span>
                                </Link>
                                
                            </div>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-heading">Quick Links</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="/about" className="footer-link">About Us</a>
                                </li>
                                <li>
                                    <a href="/patient-care/facilities" className="footer-link">Patient Care</a>
                                </li>
                                <li>
                                    <a href="/research/programs" className="footer-link">Research</a>
                                </li>
                                <li>
                                    <a href="/education/programs" className="footer-link">Education</a>
                                </li>
                              
                                
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-heading">Sub-Institutes</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="https://tmc.gov.in/" target="_blank" rel="noopener noreferrer" className="footer-link">
                                        Tata Memorial Centre
                                    </a>
                                </li>
                                <li>
                                    <a href="https://tmc.gov.in/tmh/" target="_blank" rel="noopener noreferrer" className="footer-link">
                                        Tata Memorial Hospital
                                    </a>
                                </li>
                                <li>
                                    <a href="https://tmc.gov.in/hbch/" target="_blank" rel="noopener noreferrer" className="footer-link">
                                        Homi Bhabha Cancer Hospital
                                    </a>
                                </li>
                                <li>
                                    <a href="https://tmc.gov.in/cce/" target="_blank" rel="noopener noreferrer" className="footer-link">
                                        Centre for Cancer Epidemiology
                                    </a>
                                </li>
                                
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-heading">Contact Information</h3>
                            <address className="contact-info">
                                <div className="contact-item">
                                    <LocationOn className="contact-icon" />
                                    <span className="contact-text">
                                        ACTREC, Sector 22, Kharghar, Navi Mumbai, Maharashtra 410210, India
                                    </span>
                                </div>
                                <div className="contact-item">
                                    <Phone className="contact-icon" />
                                    <a href="tel:+912227405000" className="contact-link">
                                        +91-22-2740 5000
                                    </a>
                                </div>
                                <div className="contact-item">
                                    <Email className="contact-icon" />
                                    <a href="mailto:info@actrec.gov.in" className="contact-link">
                                        info@actrec.gov.in
                                    </a>
                                </div>
                            </address>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="container footer-bottom-container">
                        <p className="copyright">&copy; {new Date().getFullYear()} ACTREC. All rights reserved.</p>
                        <div className="legal-links">
                            <a href="/privacy-policy" className="legal-link">
                                Privacy Policy
                            </a>
                            <a href="/terms-of-use" className="legal-link">
                                Terms of Use
                            </a>
                            <a href="/sitemap" className="legal-link">
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }

    export default Footer1

