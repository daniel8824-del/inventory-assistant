import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/api';
import { createLogger } from '../utils/logger';

const authLogger = createLogger('Auth');

// 사용자 역할 타입
export type UserRole = 'admin' | 'manager' | 'viewer';

// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

// Auth Context 타입
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 세션 확인 (앱 시작 시)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // 사용자 정보 + 역할 가져오기
          const userData = await fetchUserData(session.user.id, session.user.email || '');
          setUser(userData);
          authLogger.info(`Session restored: ${userData.email}`);
        }
      } catch (error) {
        authLogger.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      authLogger.debug(`Auth state changed: ${event}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchUserData(session.user.id, session.user.email || '');
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 사용자 데이터 조회 (역할 포함) - 타임아웃 적용
  const fetchUserData = async (userId: string, email: string): Promise<User> => {
    // 기본값 (폴백)
    const defaultUser: User = {
      id: userId,
      email,
      role: email === 'admin@k1solution.com' ? 'admin' : 'viewer',
    };

    try {
      // 3초 타임아웃으로 users 테이블 조회
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const queryPromise = supabase
        .from('users')
        .select('role, name')
        .eq('id', userId)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (result && 'data' in result && result.data) {
        return {
          id: userId,
          email,
          role: (result.data.role as UserRole) || defaultUser.role,
          name: result.data.name,
        };
      }
    } catch (err) {
      authLogger.debug('Using default role (DB query failed or timed out)');
    }

    return defaultUser;
  };

  // 로그인
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      authLogger.info(`Login attempt: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        authLogger.warn(`Login failed: ${error.message}`);
        
        // 에러 메시지 한글화
        let errorMessage = '로그인에 실패했습니다.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id, data.user.email || '');
        setUser(userData);
        authLogger.success(`Login successful: ${userData.email} (${userData.role})`);
        return { success: true };
      }

      return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
    } catch (error) {
      authLogger.error('Login error:', error);
      return { success: false, error: '네트워크 오류가 발생했습니다.' };
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      authLogger.info('Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      authLogger.success('Logged out successfully');
    } catch (error) {
      authLogger.error('Logout error:', error);
    }
  };

  // 역할 확인
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

