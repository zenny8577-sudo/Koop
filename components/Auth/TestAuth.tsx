import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const TestAuth: React.FC = () => {
  const { user, loading, error, signIn, signOut, signUp } = useAuth();

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-md">
        <p>Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Authentication Test</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {user ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Authenticated User</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Verification Status:</strong> {user.verificationStatus}</p>
            <p><strong>First Name:</strong> {user.firstName || 'N/A'}</p>
            <p><strong>Last Name:</strong> {user.lastName || 'N/A'}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Not Authenticated</h3>
          
          <div className="space-y-4">
            <h4 className="font-medium">Test Admin Login</h4>
            <button 
              onClick={() => signIn('brenodiogo27@icloud.com', '19011995Breno@#')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Login as Admin
            </button>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Test User Login</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email" 
                id="email"
                className="px-3 py-2 border rounded"
              />
              <input 
                type="password" 
                placeholder="Password" 
                id="password"
                className="px-3 py-2 border rounded"
              />
              <button 
                onClick={() => {
                  const email = (document.getElementById('email') as HTMLInputElement).value;
                  const password = (document.getElementById('password') as HTMLInputElement).value;
                  signIn(email, password);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAuth;