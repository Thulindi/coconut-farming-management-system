import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import ResetPasswordModal from '../components/auth/ResetPasswordModal';

const LandingPage = ({ initialModal: propInitialModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModal, setActiveModal] = useState(propInitialModal || null); // 'login', 'register', 'forgotPassword', or 'resetPassword'
  const [authSuccessMessage, setAuthSuccessMessage] = useState({ type: '', text: '' });

  React.useEffect(() => {
    if (propInitialModal) {
      setActiveModal(propInitialModal);
    }
  }, [propInitialModal]);

  const closeModals = () => {
    setActiveModal(null);
    setAuthSuccessMessage({ type: '', text: '' });
  };
  const openLogin = () => {
    setActiveModal('login');
    setAuthSuccessMessage({ type: '', text: '' });
  };
  const openRegister = () => {
    setActiveModal('register');
    setAuthSuccessMessage({ type: '', text: '' });
  };
  const openForgotPassword = () => {
    setActiveModal('forgotPassword');
    setAuthSuccessMessage({ type: '', text: '' });
  };

  const handleRegisterSuccess = (message) => {
    setAuthSuccessMessage(message);
    setActiveModal('login');
  };

  return (
    <div className="bg-background text-on-background font-body antialiased min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-backdrop {
          animation: backdropFade 0.4s ease-out forwards;
        }
        .animate-modal {
          animation: modalScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />
      {/* Top Navigation Bar */}
      <nav className="bg-white/70 backdrop-blur-xl docked full-width top-0 sticky z-50 no-line separation through tonal shifts flat no shadows px-8 py-6">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#2c4d3f] rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-2xl">eco</span>
            </div>
            <div className="text-2xl font-black text-emerald-950 tracking-tighter font-headline">CocoSmart</div>
          </div>
          
          <div className="hidden md:flex items-center bg-[#f0f4f2] rounded-full p-1.5 px-2">
            <a className="bg-white text-emerald-900 font-bold px-6 py-2 rounded-full shadow-sm font-headline tracking-tight transition-all" href="#">Home</a>
            <a className="text-emerald-800/60 font-medium px-5 py-2 hover:text-emerald-900 transition-colors font-headline tracking-tight" href="#">Features</a>
            <a className="text-emerald-800/60 font-medium px-5 py-2 hover:text-emerald-900 transition-colors font-headline tracking-tight" href="#">About</a>
            <a className="text-emerald-800/60 font-medium px-5 py-2 hover:text-emerald-900 transition-colors font-headline tracking-tight" href="#">Contact Us</a>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={openLogin}
              className="text-emerald-800/60 font-medium hover:text-emerald-900 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={openRegister}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-95 transition-transform duration-200 shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full min-h-[921px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover scale-105" 
            alt="Wide panoramic shot of a lush tropical coconut plantation" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU75pu2vVjEAcqPXYoFlzPoKe7p6eOTqHvrFYvlybCnp_TBsbPprF7Ozjhhk1TKd1ZSZ8bq9LQ0gs6oCugol1pdKld0dUW-tIpGMzcwt5s0jWIBl1fEkNBBFM1SCliEdBzGAr5DtQaka-gXqlJMGxAvVMZEwtqt2JSbZib7SxVS85UQoHSg_oC29a043k3EgKMd4K7IoF7Q6vTDf_zolVoUzcGhbKtaJWcoQazmWXqaxqt28webxpkVSC3Zuzhle190SEhz7wYrz4A"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 py-24">
            <span className="inline-block py-1 px-4 mb-6 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-xs tracking-widest font-bold uppercase">Smart Farming Solutions</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white font-headline leading-[1.1] mb-8 tracking-tighter">
              Bring Fresh Growth To Coconut Farming.
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50/80 mb-12 max-w-xl leading-relaxed">
              Optimize your plantation with precision data analytics, automated inventory management, and real-time harvesting intelligence.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={openRegister}
                className="bg-white text-primary px-10 py-5 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all duration-300 flex items-center group"
              >
                Start Managing Now
                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Solutions Section */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline mb-6 tracking-tight text-primary">Agriculture Redefined</h2>
          <p className="text-lg text-on-surface-variant">We merge traditional farming wisdom with cutting-edge digital infrastructure to secure your plantation's future.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-surface-container-low p-10 rounded-lg hover:bg-surface-container-lowest transition-all duration-500 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
            </div>
            <h3 className="text-2xl font-bold font-headline mb-4 text-primary">Real-time Stock Tracking</h3>
            <p className="text-on-surface-variant leading-relaxed mb-8 flex-grow">Maintain absolute visibility over your yield from the tree to the customer. Track every nut with digital precision.</p>
            <div className="h-48 rounded-xl overflow-hidden mt-auto">
              <img 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                alt="Organized stacks of coconuts" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsg2VMkJoZK9doW-48a3-0hw5sxfcKMiKiwYFkRtdWcwwBxrEOU8w6bJ-Lxb9ng6ZkeMFXLKYTLNjCHttuovHrLXG45LR8vS89_JVm0325lQkyHeasFD1hDIYhrBJZdvzABpHT9K4VnXuKsz24eoV97QMLn4TD7zc0emZAXUS9yS0JUWemmiGsZ_DJ_zlibbZKWcHT2KzppT1kaR5VbronnkMNJKWmS9t8N75wlECFD7sj7Au2YXi4sm-8YMxp_W3DhbOb9iyFw9qM"
              />
            </div>
          </div>
          {/* Card 2 */}
          <div className="group bg-surface-container-low p-10 rounded-lg hover:bg-surface-container-lowest transition-all duration-500 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-secondary-fixed flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-secondary text-3xl">badge</span>
            </div>
            <h3 className="text-2xl font-bold font-headline mb-4 text-primary">Automated Role Management</h3>
            <p className="text-on-surface-variant leading-relaxed mb-8 flex-grow">Streamline operations by assigning roles and tracking productivity across your entire labor force with ease.</p>
            <div className="h-48 rounded-xl overflow-hidden mt-auto">
              <img 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                alt="Agricultural professionals" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFvXxEwy5pmrJ6DKPXye8RJsqKvoZMKyBm5wAvMit8oFDYbWDI8iEEoqpjNWNATqx6z4SgHhy2MGAEiCQl6lfyeyewXFPX6f-Hx3ARpFcH8cfdgukSzUb2deVLKWr65yLyovw_jx_JiR050KThyJyBZHy_5UQGqbz9D1Ov3aLl-76fwhlPZGXh4jy9haE49G-sJylaIC6nO8g6TOYspiyGm8GDYBb-kZgAwEdsA1zsPX7dqT0wVWonkGWWp0SeWjscIVidL1NkVZzd"
              />
            </div>
          </div>
          {/* Card 3 */}
          <div className="group bg-surface-container-low p-10 rounded-lg hover:bg-surface-container-lowest transition-all duration-500 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-tertiary text-3xl">analytics</span>
            </div>
            <h3 className="text-2xl font-bold font-headline mb-4 text-primary">Precise Harvesting Insights</h3>
            <p className="text-on-surface-variant leading-relaxed mb-8 flex-grow">Data-driven predictions on when to harvest for maximum nutritional value and market price optimization.</p>
            <div className="h-48 rounded-xl overflow-hidden mt-auto">
              <img 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                alt="Data visualization of crops" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUWoxwSnH0kIkDhkPsFByc_lYzzKx5LNj7vN_3YUut_ovRhfV0O92V-bJQyksM1_p4GPz9UFVQ5mfz8UPVJbc2ZvhO-tMEZ2Wjogi1rOlhxZqII8gPIOAX0pTSvjnLJjL6nwS0exLUg8ONoh1NF5wDAses4ZmSmSreVudoyHRTjAviP1Ql-GTAt9S4_17Ol_aaPVqe_ElRj5s2p7jQLFzE38Kmh4QDtjOYYhe68hZauiWOpXSmdpAR4sXtmhMEtOYbpA1mABQUmMAu"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-primary text-white py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  className="rounded-lg w-full h-64 object-cover" 
                  alt="Tall coconut palms" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy-zlWZPgzxvU98ijOhGSpliXQqqHmJ1bv-H3oj4vou2o2KL-VoL0-DSewkNvrmwZ_aSYNgL2fbM9sYG-3_0eRSZxROHZLvlprHtoSxar4fcd7549rgz73LyYbWAN-Uxl0Ptuko_A1uJCQHi8_lBg-1URJ0c5jobL3yayoi5RKBVwVymR_fNZ65GwkAveWE9avkO9g13XgrrJi5xhnyGGrPw6-fg8QHXRh555sePrnmyE4mi-kuX1DxYxBfn3rlp1Uew6U0GAJt8uo"
                />
                <div className="bg-primary-container p-8 rounded-lg">
                  <div className="text-4xl font-bold font-headline mb-2">25%</div>
                  <div className="text-emerald-300 font-label text-xs uppercase tracking-widest">Efficiency Increase</div>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="bg-emerald-900 p-8 rounded-lg">
                  <div className="text-4xl font-bold font-headline mb-2">500+</div>
                  <div className="text-emerald-300 font-label text-xs uppercase tracking-widest">Active Plantations</div>
                </div>
                <img 
                  className="rounded-lg w-full h-64 object-cover" 
                  alt="Coconut seedlings" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBn7epU0Jgaajb1uGTo3FSEzmSulhsidFt34T1xKSyupAYgmLi6AUAfl6Sxu2_H39QZXEMkNliQUfRx6nLDgrbyzIOfe5rTzo-eH4phCeC93cdH9Ch9L34NHC4R2wFzhONl76JhEw1wt7OdQ0_XJhzq4_cSyMG8NfcWpyCilr1LiwNc0Sra4RdiFaXH9TMC1hj7TLgmRHiciWyu1Wk3JAssNBYLDzgg5IBwSLT-QH5rrNi_AdQp0epPNRSW0wWSVJHSuM0Ql10PDAWs"
                />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-extrabold font-headline mb-8 tracking-tighter leading-tight">Quantifiable Growth From The Roots Up.</h2>
            <p className="text-xl text-emerald-100/80 mb-10 leading-relaxed">
              Our platform isn't just about software; it's about the tangible results seen in every harvest. We help farmers reduce waste, optimize labor, and increase their annual yield through smarter decision-making.
            </p>
            <div className="flex items-center space-x-4">
              <div className="h-px bg-emerald-700 flex-grow"></div>
              <span className="text-emerald-400 font-label text-sm uppercase tracking-[0.2em]">The Future of Agtech</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <img 
              className="rounded-lg shadow-2xl" 
              alt="Farmer using smartphone" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXiZNpMXhw-xCwUEnp0BYKBTDy8ZJuoGhVVyF_nqw7xjzvz851KIUU9LTNFVjpeenPeoHNMxN0zUZWV83s6U2Yb9HtH8HVLSxLkdy3IUe97DyQeOOEnKUmPFAa_Cp4B2a8R2BgIX91jATSOVIaxTUh_utajngBSNtafVDu7hLfGTF3jStSBftw76sZ_j4fC0jVm4XDwYZywqfSXcDGjiVI5yjjMKsx0hHWxlS29fNEpx3W3gAvf0_xhx4MqqnraRwfqrNamVmgXwJS"
            />
          </div>
          <div className="md:w-1/2">
            <span className="text-primary font-bold font-label uppercase tracking-widest block mb-4">Our Mission</span>
            <h2 className="text-4xl font-extrabold font-headline mb-6 tracking-tight text-primary">Modernizing Tradition for a Sustainable Tomorrow.</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
              CocoSmart was founded on the belief that the world's most ancient crops deserve the world's most advanced technology. Our mission is to bridge the gap between rural farming traditions and the digital age, ensuring that coconut farmers everywhere can thrive in a modern global market.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-emerald-600 mt-1">check_circle</span>
                <span className="text-on-surface font-medium">Sustainable farming through precision irrigation and nutrient management.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-emerald-600 mt-1">check_circle</span>
                <span className="text-on-surface font-medium">Empowering local communities with digital literacy and data access.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-emerald-600 mt-1">check_circle</span>
                <span className="text-on-surface font-medium">Transparent supply chains that value the producer and the planet.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 text-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black font-headline mb-8 tracking-tighter text-primary">Ready to start managing?</h2>
          <p className="text-xl text-on-surface-variant mb-12">Join hundreds of plantations already cultivating the future of smart agriculture.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={openRegister}
              className="bg-primary text-white px-12 py-5 rounded-full font-bold text-xl hover:scale-95 transition-transform shadow-xl"
            >
              Create Your Account
            </button>
            <button className="bg-surface-container-high text-on-surface px-12 py-5 rounded-full font-bold text-xl hover:bg-surface-container-highest transition-colors">Contact Our Experts</button>
          </div>
        </div>
      </section>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={activeModal === 'login'} 
        onClose={closeModals} 
        onSwitchToRegister={openRegister}
        successMessage={authSuccessMessage}
        onClearMessage={() => setAuthSuccessMessage({ type: '', text: '' })}
        onForgotPassword={openForgotPassword}
      />
      <RegisterModal 
        isOpen={activeModal === 'register'} 
        onClose={closeModals} 
        onSwitchToLogin={openLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />
      <ForgotPasswordModal
        isOpen={activeModal === 'forgotPassword'}
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />
      <ResetPasswordModal
        isOpen={activeModal === 'resetPassword'}
        onClose={closeModals}
      />

      {/* Footer */}
      <footer className="bg-emerald-950 dark:bg-black text-emerald-50 dark:text-emerald-100 full-width rounded-t-[4rem] px-12 py-16 mt-24">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div>
            <div className="text-xl font-bold text-white mb-4">CocoSmart</div>
            <p className="font-inter text-sm tracking-wide uppercase text-emerald-300/70">© 2024 CocoSmart Management. Cultivating Precision.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-inter text-sm tracking-wide uppercase text-emerald-300/70 hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="font-inter text-sm tracking-wide uppercase text-emerald-300/70 hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="font-inter text-sm tracking-wide uppercase text-emerald-300/70 hover:text-white transition-colors" href="#">Contact Support</a>
            <a className="font-inter text-sm tracking-wide uppercase text-emerald-300/70 hover:text-white transition-colors" href="#">Sustainability Report</a>
          </div>
          <div className="flex space-x-6">
            <a className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:opacity-80 transition-opacity" href="#">
              <span className="material-symbols-outlined text-white text-lg">public</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:opacity-80 transition-opacity" href="#">
              <span className="material-symbols-outlined text-white text-lg">share</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
