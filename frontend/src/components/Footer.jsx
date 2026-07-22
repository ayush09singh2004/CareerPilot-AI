import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-borderMain pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            CareerPilot AI
          </Link>
          <p className="text-gray-500">
            Build Your Resume. Discover Your Career. The ultimate AI-powered career guidance platform.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-textMain mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-500 hover:text-primary transition-colors">Home</Link></li>
            <li><a href="#features" className="text-gray-500 hover:text-primary transition-colors">Features</a></li>
            <li><a href="#about" className="text-gray-500 hover:text-primary transition-colors">About</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-textMain mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="text-gray-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-gray-500 hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-textMain mb-4">Contact</h4>
          <ul className="space-y-2">
            <li><a href="mailto:hello@careerpilot.ai" className="text-gray-500 hover:text-primary transition-colors">hello@careerpilot.ai</a></li>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors">
                {/* Social Icon */}
                <span className="sr-only">Twitter</span>
                𝕏
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors">
                {/* Social Icon */}
                <span className="sr-only">LinkedIn</span>
                in
              </a>
            </div>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-gray-100 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} CareerPilot AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
