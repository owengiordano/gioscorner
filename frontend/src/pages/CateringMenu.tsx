import { useState } from 'react';
import chickenPicatta from '../assets/chicken-picatta.jpeg';
import { submitCateringInterest } from '../services/api';

export default function CateringMenu() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await submitCateringInterest(email);
      setSubmitStatus('success');
      setEmail('');
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto">
        <img
          src={chickenPicatta}
          alt="Delicious chicken piccata with lemon and capers"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Content */}
      <div 
        className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 py-16 md:py-0"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="max-w-md w-full text-center md:text-left">
          {/* Heading */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl mb-4 tracking-wide"
            style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D3B2D',
              fontWeight: 400,
              lineHeight: 1.1
            }}
          >
            CATERING MENU
            <br />
            COMING SOON
          </h1>

          {/* Subheading */}
          <p 
            className="text-xl md:text-2xl mb-8"
            style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D3B2D',
              fontWeight: 400
            }}
          >
            Sign Up for Launch Updates
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address*"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-white font-medium rounded-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#2D3B2D' }}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </form>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <p className="mt-4 text-green-700 font-medium">
              Thank you! We'll notify you when our catering menu launches.
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="mt-4 text-red-600 font-medium">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
