import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Code, Chrome, Shield, Users, Zap } from 'lucide-react';

export default function GoogleAuth() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl">
              <Code className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent mb-2">
            CodeSphere
          </h1>
          <p className="text-slate-400 text-sm">
            Real-Time Collaborative Code Editor
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome to CodeSphere
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to start collaborating with your team
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border-0"
            >
              {isSigningIn ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Chrome className="w-5 h-5" />
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>

            {/* Features Preview */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center mb-4">
                What you'll get access to:
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Real-time Code Editor</div>
                    <div className="text-xs text-slate-500">Multi-language support with live collaboration</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Team Collaboration</div>
                    <div className="text-xs text-slate-500">Chat, whiteboard, and presence indicators</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Secure & Private</div>
                    <div className="text-xs text-slate-500">Your code stays safe with Google authentication</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="text-center pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                By signing in, you agree to our{' '}
                <span className="text-blue-400 hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-blue-400 hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            Built with <Code className="w-3 h-3 text-red-400 inline mx-1" /> for collaborative coding
          </p>
        </div>
      </div>
    </div>
  );
}