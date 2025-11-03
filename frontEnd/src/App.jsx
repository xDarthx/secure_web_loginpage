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

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

const deriveKey = async (password, salt) => {
  const enc = new TextEncoder();
  const importedPassword = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedPassword,
    {name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

const encryptData = async (key, dataString) => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(dataString)
  );

  return {
    iv: arrayBufferToBase64(iv),
    encryptedData: arrayBufferToBase64(encryptedData),
  };
};

const decryptData = async (key, iv_base64, encryptedData_base64) => {
  const iv = base64ToArrayBuffer(iv_base64);
  const encryptedData = base64ToArrayBuffer(encryptedData_base64);

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (e) {
    console.error('Decryption failed', e);
    throw new Error('Could not decrypt data. Wrong password?');
  }
};

const DB_KEY = 'userDatabase';

const loadUserDatabase = () => {
  try {
    const dbString = window.localStorage.getItem(DB_KEY);
    return dbString ? JSON.parse(dbString) : [];
  } catch (e) {
    console.error('Could not load user database:', e);
    return [];
  }
};

const saveUserDatabase = (database) => {
  try {
    const dbString = JSON.stringify(database);
    window.localStorage.setItem(DB_KEY, dbString);
  } catch (e) {
    console.error('Could not save user database:', e);
  }
};

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

const LoginForm = ({ onSwitchToSignUp, setGlobalMessage, setGlobalError }) => {
  const [email,setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalMessage('');
    setGlobalError('');

    /*
    axios.post('')
    */

    const userDatabase = loadUserDatabase();
    if (userDatabase.length === 0) {
      setGlobalError('No users found. Please sign up first.');
      return;
    }

    const user = userDatabase.find((u) => u.email === email);
    if (!user) {
      setGlobalError('Invalid email or password.'); // Be vague for security
      return;
    }

    try {
      const salt = base64ToArrayBuffer(user.salt);

      const key = await deriveKey(password, salt);

      const decryptedFullName = await decryptData(
        key,
        user.encryptedData.iv,
        user.encryptedData.encryptedData
      );
      setGlobalMessage(`Welcome back, ${decryptedFullName}!`);
    } catch (error) {
      console.error('Login attempt failed:', error);
      setGlobalError('Invalid email or password.');
    }
    setPassword('');
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

const SignUpForm = ({ onSwitchToLogin, setGlobalMessage, setGlobalError }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGlobalMessage('');
    setGlobalError('');

    try {
      const userDatabase = loadUserDatabase();

      const existingUser = userDatabase.find((u) => u.email === email);
      if (existingUser) {
        setGlobalError('An account with this email already exists.');
        return;
      }

      const salt = window.crypto.getRandomValues(new Uint8Array(16));

      const key = await deriveKey(password, salt);

      const encryptedData = await encryptData(key, fullName);

      const user = {
        email: email,
        salt: arrayBufferToBase64(salt),
        encryptedData: encryptedData,
      };

      const newDatabase = [...userDatabase, user];
      saveUserDatabase(newDatabase);

      setGlobalMessage('Account created! You can now log in.');

      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Failed to sign up:', err);
      setGlobalError('An error occurred during sign up. See console.');
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

      {view === 'login' ? (
        <LoginForm
          onSwitchToSignUp={switchToSignUp}
          setGlobalMessage={setGlobalMessage}
          setGlobalError={setGlobalError}
        />
      ) : (
        <SignUpForm
          onSwitchToLogin={switchToLogin}
          setGlobalMessage={setGlobalMessage}
          setGlobalError={setGlobalError}
        />
      )}
    </div>
  );
}


export default App
