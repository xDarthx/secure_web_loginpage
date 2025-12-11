import { useState } from 'react'
import axios from 'axios';

/**
 * !IMPORTANT NOTICE!
 * 
 * All styling was done by Gemini cause I wanted to see what Gemini pro could do with tailwind.
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

/** 
 * QR Code Icon
*/
const QrCodeIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const FormInput = ({ id, type, placeholder, icon, value, onChange}) => (
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
      value={value}
      onChange={onChange}
    />
  </div>  
);

const MessageDisplay = ({ type, message, children }) => {
  if (!message && !children) return null;

  const baseClasses = 'w-full rounded-lg p-4 text-sm font-medium';
  let typeClasses = '';

  switch (type) {
    case 'error':
      typeClasses = 'bg-red-100 text-red-800';
      break;
    case 'success':
      typeClasses = 'bg-green-100 text-green-800';
      break;
    case 'warning':
    default:
      typeClasses = 'bg-yellow-100 text-yellow-800';
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
      {children}
    </div>
  );
};

/** 
 * FORGOT PASSWORD FORM
*/
const ForgotPasswordForm = ({ onSwitchToLogin, setGlobalMessage, setGlobalError}) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setGlobalMessage('Generating security QR code...');

    try{
      const qrResponse = await axios.get(`http://localhost:8081/mfa/qr/${email}`);
      
      setQrImage(qrResponse.data);
      setStep(2);
      setGlobalMessage('Please scan the QR code to verify identity.');
    } catch (err) {
      console.error(err);
      setGlobalError('Could not generate QR code. Check email format.');
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setGlobalError('');

    try {
      const response = await axios.post('http://localhost:8081/mfa/verify', {
        id: email,
        code: mfaCode
      });

      if (response.data === true || response.data === "TRUE") {
        setStep(3);
        setGlobalMessage('Identity Verified. Please enter new password.');
      } else {
        setGlobalError('Invalid code. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setGlobalError('Verification failed.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setGlobalError(''); 

    try{
      const response = await axios.post('http://localhost:8081/reset-password', {
        email: email,
        newPassword: newPassword
      });
      setGlobalMessage(response.data.message);

      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      console.error(err);
      setGlobalError('Failed to update password.');
    }
  };

  return (
    <div className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl md:p-10'>
      <h2 className="text-center text-3xl font-bold text-gray-900">Reset Password</h2>

      {/* STEP 1: Email Input */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <p className="text-center text-gray-500">Enter your email to begin the recovery process.</p>
          <FormInput
            id="email"
            type="email"
            placeholder="Email address"
            icon={<MailIcon className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className='w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-700'>
            Next
          </button>
        </form>
      )}

      {/* STEP 2: MFA Verification */}
      {step === 2 && (
        <form onSubmit={handleMfaVerify} className="space-y-6">
           <p className="text-center text-sm text-gray-500">
            Scan this with your Authenticator App and enter the code to prove it's you.
          </p>
          <div className="flex justify-center my-4">
            {qrImage && (
              <img src={qrImage} alt="QR Code" className="border-4 border-gray-200 rounded-lg"/>
            )}
          </div>
          <FormInput
            id="mfaCode"
            type="text"
            placeholder="Authenticator Code"
            icon={<QrCodeIcon className="h-5 w-5" />}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
          />
          <button type="submit" className='w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white shadow-md hover:bg-green-700'>
            Verify Identity
          </button>
        </form>
      )}

      {/* STEP 3: New Password */}
      {step === 3 && (
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <p className="text-center text-gray-500">Enter your new password.</p>
          <FormInput
            id="newPassword"
            type="password"
            placeholder="New Password"
            icon={<LockIcon className="h-5 w-5" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" className='w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-700'>
            Update Password
          </button>
        </form>
      )}

      <div className='text-center'>
        <button onClick={onSwitchToLogin} className='text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline'>
          Back to Login
        </button>
      </div>
    </div>
  );
};

const LoginForm = ({ onSwitchToSignUp, onSwitchToForgot, setGlobalMessage, setGlobalError }) => {
  const [email,setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalMessage('');
    setGlobalError('');

    try {
      const response = await axios.post('http://localhost:8081/login', {
        email,
        password
      });

      setGlobalMessage(`Welcome back, ${response.data.fullName}!`);
      setPassword('');

    } catch (error) {
      console.error('Login attempt failed:', error);

      if(error.response && error.response.data && error.response.data.error) {
        setGlobalError(error.response.data.error);
      } else {
        setGlobalError('Login failed. Please check your server connection.');
      }
    }
  };

  return (
    <div className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl md:p-10'>
      <h2 className="text-center text-3xl font bold text-gray-900">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon className="h-5 w-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          id="password"
          type="password"
          placeholder="Password"
          icon={<LockIcon className="h-5 w-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className='text-right'>
          <a onClick={onSwitchToForgot} className='text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline'>
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

const SignUpForm = ({ onSwitchToLogin, setGlobalMessage, setGlobalError }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalMessage('');
    setGlobalError('');

    try {
      const response = await axios.post('http://localhost:8081/register', {
        fullName,
        email,
        password
      });

      setGlobalMessage(response.data.message || 'Account created! You can now log in.');

      setFullName('');
      setEmail('');
      setPassword('');

      //onSwitchToLogin();

    } catch (err) {
      console.error('Failed to sign up:', err);
      if(err.response && err.response.data && err.response.data.error) {
        setGlobalError(err.response.data.error);
      } else {
        setGlobalError('An error occurred during sign up. Is the server running?');
      }
    }
  };

  return (
    <div className='w-full max-w-md space-y-6 rounded-2x1 bg-white p-8 shadow-x1 md:p-10'>
      <h2 className='text-center text-3xl font-bold text-gray-900'>
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <FormInput
          id="fullName"
          type="text"
          placeholder="Full Name"
          icon={<UserIcon className="h-5 w-5" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <FormInput
          id="signup-email"
          type="email"
          placeholder="Email address"
          icon={<MailIcon className="h-5 w-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          id="signup-password"
          type="password"
          placeholder="Password"
          icon={<LockIcon className="h-5 w-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
  const [globalMessage, setGlobalMessage] = useState('');
  const [globalError, setGlobalError] = useState('');

  const switchToLogin = () => {
    setView('login');
    setGlobalMessage('');
    setGlobalError('');
  };

  const switchToForgot = () => {
    setView('forgot');
    setGlobalMessage('');
    setGlobalError('');
  };

  const switchToSignUp = () => {
    setView('signup');
    setGlobalMessage('');
    setGlobalError('');
  };

  return (
    <div className="font-inter flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <MessageDisplay type="success" message={globalMessage} />
        <MessageDisplay type="error" message={globalError} />
      </div>

      {view === 'login' && (
        <LoginForm
          onSwitchToSignUp={switchToSignUp}
          onSwitchToForgot={switchToForgot}
          setGlobalMessage={setGlobalMessage}
          setGlobalError={setGlobalError}
        />
      )} 
      {
        view === 'signup' && (
        <SignUpForm
          onSwitchToLogin={switchToLogin}
          setGlobalMessage={setGlobalMessage}
          setGlobalError={setGlobalError}
        />
      )}
      {
        view === 'forgot' && (
        <ForgotPasswordForm
          onSwitchToLogin={switchToLogin}
          setGlobalMessage={setGlobalMessage}
          setGlobalError={setGlobalError}
        />
      )}
    </div>
  );
}


export default App
