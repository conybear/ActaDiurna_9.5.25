import { useState } from 'react';
import { authAxios } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Scroll } from 'lucide-react';

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await authAxios.post(endpoint, payload);
      localStorage.setItem('token', res.data.access_token);
      setUser(res.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-400">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Scroll className="w-10 h-10 text-amber-900" />
            <h1 className="text-5xl font-bold text-amber-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Acta Diurna
            </h1>
          </div>
          <p className="text-amber-900 text-lg italic" style={{ fontFamily: 'Merriweather, serif' }}>
            "Daily Acts" - Share Your Stories
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-2 border-amber-900/20" data-testid="auth-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-amber-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? 'Sign in to continue your stories' : 'Join the community today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="email-input"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    data-testid="username-input"
                    placeholder="Your name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>

              <Button
                type="submit"
                data-testid="auth-submit-btn"
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 rounded-xl"
                disabled={loading}
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                data-testid="toggle-auth-mode-btn"
                className="text-amber-700 hover:text-amber-900 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;