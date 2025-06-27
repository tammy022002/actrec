import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import "../assets/HomePage1.css"
import Button from "@mui/material/Button"
import homepageImage from "../assets/images/homepage_image.jpg";
import { Modal } from '@fluentui/react/lib/Modal';
import { ArrowRight, Database, FileText, Server, Users } from "lucide-react"
import { useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import Footer1 from "./Footer1";
export default function HomePage1() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate()
  const goToLoginPage = () => {
    navigate('/login');
  }
  const goToSignupPage = () => {
    navigate('/signup');
  }
  const goToSigninPage = () => {
    setIsModalOpen(true);
    

    // alert("Please Sign-in to access the Web Query")
  }
  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/login');
  };
  const goToHomepage = () => {
    setIsModalOpen(false);
    navigate('/');
  }




 

    

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar></Navbar>
      <div className="button-container">
        <button
          type="button"
          className="btn btn-primary"
          style={{ cursor: 'pointer', backgroundColor: '#007bff' }}
          onClick={goToLoginPage}
        >
          Sign-in
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ cursor: 'pointer', backgroundColor: '#007bff' }}
          onClick={goToSignupPage}
        >
          Create Account
        </button>
      </div>
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Content Section */}
            <div className="space-y-6 md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                dbNSFP: Database for Nonsynonymous SNPs' Functional Predictions
              </h1>
              <p className="text-xl text-muted-foreground">
                A comprehensive database of functional predictions and annotations for human nonsynonymous SNPs and
                splice-site variants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="contained"
                  color="error"
                  onClick={goToSigninPage}
                  style={{ backgroundColor: "#dc2626", textTransform: "none" }}
                  endIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Web Query
                </Button>
              </div>
            </div>

            {/* Image Section */}
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl bg-gray-100 flex items-center justify-center md:w-1/2">
  <img
    src={homepageImage} // Use imported image here
    alt="dbNSFP Database"
    className="w-full h-full object-cover"
  />
</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="p-8">
        {/* Database Features Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Database Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-white rounded-lg shadow-md text-center">
              <div className="text-red-500 mb-2">
                <Database size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Comprehensive Coverage</h3>
              <p>
                Contains functional predictions and annotations for all potential nonsynonymous single-nucleotide
                variants (nsSNVs) in the human genome.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md text-center">
              <div className="text-red-500 mb-2">
                <FileText size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Multiple Annotations</h3>
              <p>
                Integrates predictions from SIFT, PolyPhen-2, LRT, MutationTaster, FATHMM, PROVEAN, MetaSVM, and more.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md text-center">
              <div className="text-red-500 mb-2">
                <Server size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Regular Updates</h3>
              <p>
                Continuously updated with new prediction algorithms and population frequency data from major sequencing
                projects.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md text-center">
              <div className="text-red-500 mb-2">
                <Users size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Dual Access</h3>
              <p>
                Available through web query interface for interactive use and downloadable files for large-scale
                analyses.
              </p>
            </div>
          </div>
        </div>

        {/* Database Statistics Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Database Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-red-50 p-6 rounded-lg">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-red-500 text-3xl font-bold mb-2">84,013,490</h3>
              <p>Total nsSNVs</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-red-500 text-3xl font-bold mb-2">22,793</h3>
              <p>Genes Covered</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-red-500 text-3xl font-bold mb-2">40+</h3>
              <p>Functional Annotations</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-red-500 text-3xl font-bold mb-2">5.0</h3>
              <p>Current Version</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      {/* <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have questions or suggestions about dbNSFP? We'd love to hear from you.
          </p>
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate("/contact")}
            style={{ backgroundColor: "#dc2626", textTransform: "none" }}
          >
            Contact Us
          </Button>
        </div>
      </section> */}
      <Footer1></Footer1>
      <Modal isOpen={isModalOpen} onDismiss={closeModal} className="customModal">
        <div className="modalContent">
         <CloseIcon className="closeIcon" onClick={goToHomepage} />
          <h3>Please Sign-in to access the Web Query</h3>
          <button className="btn" onClick={closeModal}>OK</button>
        </div>
      </Modal>
    </main>
  )
}

