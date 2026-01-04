import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-body flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-agent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-agent-cyan/20 to-violet-500/20 rounded-2xl mb-4 border border-agent-cyan/30">
              <span className="text-2xl font-bold text-agent-cyan">K1</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">K-ONE Solution</h1>
            <p className="text-sm text-zinc-500">재고관리 시스템에 로그인하세요</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-rose-400 flex-shrink-0" size={18} />
              <span className="text-sm text-rose-400">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-bg-body border border-border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-agent-cyan/50 focus:ring-1 focus:ring-agent-cyan/50 transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-bg-body border border-border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-agent-cyan/50 focus:ring-1 focus:ring-agent-cyan/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-agent-cyan to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-agent-cyan/20"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>로그인</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-zinc-600">
              © 2026 K-ONE Solution. All rights reserved.
            </p>
          </div>
        </div>

        {/* Version Badge & Theme Toggle */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="text-xs text-zinc-600 font-mono">v1.0.0</span>
          
          {/* 테마 토글 */}
          <div 
            onClick={toggleTheme}
            className="flex items-center bg-zinc-800 border border-border rounded-full p-0.5 cursor-pointer relative"
            style={{ width: '52px' }}
          >
            <div 
              className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
                isDark ? 'left-0.5' : 'left-[calc(100%-26px)]'
              }`}
            />
            <div className={`w-6 h-6 flex items-center justify-center z-10 transition-colors duration-300 ${
              isDark ? 'text-zinc-800' : 'text-zinc-400'
            }`}>
              <Moon size={12} />
            </div>
            <div className={`w-6 h-6 flex items-center justify-center z-10 transition-colors duration-300 ${
              !isDark ? 'text-amber-500' : 'text-zinc-500'
            }`}>
              <Sun size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

