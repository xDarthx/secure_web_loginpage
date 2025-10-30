import { useState } from 'react'
import { encrypt } from 'bycrypt'
import { decrypt } from 'bycrypt'
import './App.css'

/**
 * !IMPORTANT NOTICE!
 * 
 * All styling was done by Gemini cause I wanted to see what Gemini pro could do.
 */

/**
 * Mail Icon Component
 */
const MailIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

/**
 * Lock Icon Component
 */
const LockIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

/**
 * User Icon Component
 */
const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const FormInput = ({ id, type, placeholder, icon }) => (
  <div className='relative flex items-center'>
    <span className='absolute left-4 text-gray-400'>
      {icon}
    </span>
    <input
      id={id}
      name={id}
      type={type}
      required
      className='w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
      placeholder={placeholder}
    />
  </div>  
);

const LoginForm = ({ onSwitchToSignUp }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    
    console.log("Login submitted");
  };

  return (
    <div className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl md:p-10'>
      <h2 className="text-center text-3x1 font bold text-gray-900">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon className="h-5 w-5" />}
        />

        <FormInput
          id="password"
          type="password"
          placeholder="Password"
          icon={<LockIcon className="h-5 w-5" />}
        />

        <div className='text-right'>
          <a href="#" className='text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline'>
            Forgot password?
          </a>
        </div>

        <button type="submit" className='w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
          Log In
        </button>
      </form>

      <p className='text-center text-sm text-gray-600'>
        Don't have an account?{' '}
        <button onClick={onSwitchToSignUp} className='font-medium text-blue-500 hover:underline focus:outline-none'>
          Sign Up
        </button>
      </p>
    </div>
  )
};

const SignUpForm = ({ onSwitchToLogin }) => {
  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Sign up submitted");
  };

  return (
    <div className='w-full max-w-md space-y-6 rounded-2x1 bg-white p-8 shadow-x1 md:p-10'>
      <h2 className='text-center text-3x1 font-bold text-gray-900'>
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <FormInput
          id="fullName"
          type="text"
          placeholder="Full Name"
          icon={<UserIcon className="h-5 w-5" />}
        />

        <FormInput
          id="signup-email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon className="h-5 w-5" />}
        />

        <FormInput
          id="signup-password"
          type="password"
          placeholder="Password"
          icon={<LockIcon className="h-5 w-5" />}
        />

        <button type="submit" className='w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
          Sign Up
        </button>
      </form>

      <p className='text-center text-sm text-gray-600"'>
                Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500 hover:underline focus:outline-none">
          Log In
        </button>
      </p>
    </div>
  )
}

function App() {
  const [view, setView] = useState('login');

  return (
    <div className="font-inter flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      {view === 'login' ? (
        <LoginForm onSwitchToSignUp={() => setView('signup')} />
      ) : (
        <SignUpForm onSwitchToLogin={() => setView('login')} />
      )}
    </div>
  );
}


export default App
