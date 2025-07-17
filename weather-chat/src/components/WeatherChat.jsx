import React, { useState, useEffect } from 'react';
import { Send, Cloud } from 'lucide-react';

const WeatherChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Google OAuth implementation
  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '477050056429-alcrf17a610i3h4sn6uk7b7nbfloa0lm.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        
        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: 250,
            logo_alignment: 'left',
            text: 'signin_with'
          }
        );

        // Also show the One Tap prompt
        window.google.accounts.id.prompt();
      }
    };

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = (response) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      setUser({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub // Google user ID
      });

      // Add welcome message
      setMessages([{
        id: 1,
        text: `Hi ${payload.name}! I'm your weather assistant. Ask me about the weather today!`,
        sender: 'bot',
        time: new Date().toLocaleTimeString()
      }]);

      console.log('User signed in:', payload.name, payload.email);
    } catch (error) {
      console.error('Error parsing Google sign-in response:', error);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setMessages([]);
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
  
  try {
   /* // Environment-aware API URL
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://weather-chat-backend.railway.app/chat'  // update with backend deployment later
      : 'http://127.0.0.1:5000/chat';*/
      const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      text: data.response,
      sender: 'bot',
      time: new Date().toLocaleTimeString()
    }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString()
      }]);
    }
    setLoading(false);
  };

// Login screen
if (!user) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Clouds */}
        <div className="absolute top-20 left-10 w-24 h-16 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-32 h-20 bg-white bg-opacity-15 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        <div className="absolute top-64 left-1/4 w-20 h-12 bg-white bg-opacity-10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Animated Raindrops */}
        <div className="absolute top-0 left-1/3 w-1 h-8 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '1s'}}></div>
        <div className="absolute top-0 left-2/3 w-1 h-6 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '1.2s'}}></div>
        <div className="absolute top-0 right-1/4 w-1 h-10 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.8s', animationDuration: '0.9s'}}></div>
        
        {/* Sun Rays */}
        <div className="absolute top-16 right-16 w-2 h-16 bg-yellow-300 bg-opacity-30 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-20 right-12 w-2 h-12 bg-yellow-300 bg-opacity-40 transform rotate-90 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-12 right-20 w-2 h-14 bg-yellow-300 bg-opacity-35 transform rotate-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      {/* Main Login Card */}
      <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center max-w-md w-full relative z-10 border border-white border-opacity-20">
        {/* Weather Icon Logo */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          {/* Sun */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
          
          {/* Cloud overlay */}
          <div className="absolute bottom-2 left-2 w-16 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full opacity-90 animate-pulse"></div>
          <div className="absolute bottom-3 right-1 w-12 h-8 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full opacity-80 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Lightning bolt */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-200 text-xl animate-bounce" style={{animationDelay: '2s'}}>
            ⚡
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          WeatherChat
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Get personalized weather information wherever you are.
        </p>
        
        {/* Google Sign-In Button Container */}
        <div id="google-signin-btn" className="mb-6 flex justify-center"></div>
        
        <p className="text-sm text-gray-500 mt-4">
          Sign in with your Google account to get started
        </p>
        
        {/* Loading indicator */}
        <div className="mt-4 text-xs text-gray-400">
          {!window.google && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span className="ml-2">Loading Google Sign-In...</span>
            </div>
          )}
        </div>
        
        {/* Weather Animation at Bottom */}
        <div className="mt-6 flex justify-center space-x-4 text-2xl">
          <span className="animate-bounce" style={{animationDelay: '0s'}}>🌤️</span>
          <span className="animate-bounce" style={{animationDelay: '0.5s'}}>🌧️</span>
          <span className="animate-bounce" style={{animationDelay: '1s'}}>⛈️</span>
          <span className="animate-bounce" style={{animationDelay: '1.5s'}}>🌈</span>
        </div>
      </div>
    </div>
  );
}

  // Chat screen
  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">WeatherChat</h1>
        </div>
        <div className="flex items-center space-x-3">
          <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
          <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-xs ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-white border p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about the weather..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherChat;