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
        text: `Hi ${payload.name}! I'm your weather assistant. Ask me about the weather in your area!`,
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
      const response = await fetch('http://localhost:5000/chat', {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Cloud className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WeatherChat</h1>
          <p className="text-gray-600 mb-8">
            Get personalized weather information through natural conversation
          </p>
          
          {/* Google Sign-In Button */}
          <div id="google-signin-btn" className="mb-4"></div>
          
          <p className="text-sm text-gray-500 mt-4">
            Sign in with your Google account to get started
          </p>
          
          {/* Loading state for Google button */}
          <div className="mt-4 text-xs text-gray-400">
            {!window.google && "Loading Google Sign-In..."}
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