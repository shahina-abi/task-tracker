import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import heroBg from '../assets/hero-bg.png';

const Home = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
      .fromTo(descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(btnRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5 },
        "-=0.3"
      )
      .fromTo('.feature-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 },
        "-=0.3"
      );

    // Background animation
    gsap.to('.bg-blob', {
      y: '50px',
      x: '30px',
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, []);

  return (
    <div className="relative overflow-hidden" ref={heroRef}>
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <img
          src={heroBg}
          alt="Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/50 to-dark"></div>
      </div>

      <div className="container mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Boost your productivity.
        </h1>

        <p ref={descRef} className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Stay organized. Track your tasks effortlessly. The modern way to manage your daily goals.
        </p>

        <div ref={btnRef}>
          <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center gap-3 group">
            Get Started Now
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div ref={featuresRef} className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[
            { title: "Simple & Intuitive", desc: "Clean interface designed for focus." },
            { title: "Stay Organized", desc: "Categorize and prioritize with ease." },
            { title: "Track Progress", desc: "Visualize your productivity journey." }
          ].map((feature, index) => (
            <div key={index} className="feature-item card text-left hover:-translate-y-2">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-primary text-xl">
                <FaCheckCircle />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
