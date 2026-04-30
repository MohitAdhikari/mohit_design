'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate form submission to contact@phoneocean.com
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="bg-white dark:bg-[#111116] border border-[#00FF66]/30 p-8 rounded-2xl shadow-sm dark:shadow-[0_0_15px_rgba(0,255,102,0.1)] text-center">
        <div className="w-16 h-16 bg-[#00FF66]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-[#00FF66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-2">Message Sent!</h3>
        <p className="text-gray-600 dark:text-gray-400 font-sans mb-6">
          Thank you for reaching out to PHONEOCEAN. We usually respond within 24–48 hours.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="px-6 py-3 bg-white dark:bg-[#111116] border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white font-bold text-sm tracking-widest uppercase rounded-xl transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs font-mono font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="w-full bg-gray-50 dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800 focus:border-blue-600 dark:focus:border-[#00E5FF] text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-mono font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
            className="w-full bg-gray-50 dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800 focus:border-blue-600 dark:focus:border-[#00E5FF] text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-xs font-mono font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          Subject <span className="text-gray-500 dark:text-gray-600 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Business Inquiry / Partnership"
          className="w-full bg-gray-50 dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800 focus:border-blue-600 dark:focus:border-[#00E5FF] text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-xs font-mono font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="How can we help you?"
          rows={5}
          className="w-full bg-gray-50 dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800 focus:border-blue-600 dark:focus:border-[#00E5FF] text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#00E5FF] to-[#0077FF] text-[#0B0B0F] font-black tracking-widest uppercase text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]"
      >
        {status === 'submitting' ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0B0B0F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
