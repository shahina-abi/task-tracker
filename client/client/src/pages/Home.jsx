import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { FaArrowRight, FaCheckCircle, FaClock, FaBrain, FaChartLine } from 'react-icons/fa';
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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-blob absolute left-[8%] top-28 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="bg-blob absolute right-[10%] top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200">
          AI Study Planner for students and focused professionals
        </div>

        <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Plan smarter. Study better. Finish what matters.
        </h1>

        <p ref={descRef} className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Turn scattered deadlines into a focused daily system with AI planning, weekly productivity reviews, and reminders that keep you moving.
        </p>

        <div ref={btnRef} className="flex flex-col items-center gap-4 sm:flex-row">
          <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center gap-3 group">
            Open My Planner
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/register" className="rounded-full border border-slate-700 bg-slate-900/70 px-8 py-4 text-lg font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800">
            Create Free Account
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 text-left md:grid-cols-3">
          {[
            { title: 'Daily Clarity', desc: 'AI suggests what to tackle in the morning, afternoon, and evening.', icon: FaClock },
            { title: 'Study Momentum', desc: 'Track category time so you can see where your week really goes.', icon: FaChartLine },
            { title: 'Gentle Coaching', desc: 'Reminders and summaries turn your task list into a feedback loop.', icon: FaBrain },
          ].map(({ title, desc, icon: Icon }) => (
            <div key={title} className="rounded-[1.5rem] border border-slate-700/60 bg-slate-900/70 p-4">
              <Icon className="text-xl text-sky-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        <div ref={featuresRef} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[
            { title: "Prioritize with context", desc: "Deadlines, urgency, and AI guidance help you choose the next best task." },
            { title: "See your week clearly", desc: "Visual reports turn category hours and completed work into progress you can feel." },
            { title: "Stay consistent", desc: "Reminder panels and email-ready settings reduce forgotten tasks and last-minute panic." }
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
