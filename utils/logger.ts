/**
 * Logger Utility
 * - 개발 환경: 모든 로그 출력 (색상 포함)
 * - 운영 환경: 에러만 출력, 민감 정보 제거
 */

import { IS_DEV } from '../constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 로그 레벨별 색상
const LOG_COLORS = {
  debug: '#71717a', // zinc-500
  info: '#22d3ee',  // cyan-400
  warn: '#fbbf24',  // amber-400
  error: '#f43f5e', // rose-500
  success: '#4ade80', // green-400
};

// 운영 환경에서 출력할 로그 레벨
const PROD_LOG_LEVELS: LogLevel[] = ['error'];

class Logger {
  private prefix: string;

  constructor(prefix: string = 'APP') {
    this.prefix = prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    if (IS_DEV) return true;
    return PROD_LOG_LEVELS.includes(level);
  }

  private formatMessage(level: string, message: string): string {
    return `[${this.prefix}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) return;
    console.log(
      `%c${this.formatMessage('DEBUG', message)}`,
      `color: ${LOG_COLORS.debug}`,
      ...args
    );
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return;
    console.log(
      `%c${this.formatMessage('INFO', message)}`,
      `color: ${LOG_COLORS.info}`,
      ...args
    );
  }

  success(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return;
    console.log(
      `%c${this.formatMessage('SUCCESS', message)}`,
      `color: ${LOG_COLORS.success}`,
      ...args
    );
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(
      `%c${this.formatMessage('WARN', message)}`,
      `color: ${LOG_COLORS.warn}`,
      ...args
    );
  }

  error(message: string, ...args: any[]): void {
    // 에러는 항상 출력
    console.error(
      `%c${this.formatMessage('ERROR', message)}`,
      `color: ${LOG_COLORS.error}`,
      ...args
    );
  }

  // 개발 환경에서만 실행되는 그룹 로그
  group(label: string, callback: () => void): void {
    if (!IS_DEV) return;
    console.group(label);
    callback();
    console.groupEnd();
  }

  // 개발 환경에서만 테이블 출력
  table(data: any[], columns?: string[]): void {
    if (!IS_DEV) return;
    console.table(data, columns);
  }
}

// 기본 로거 인스턴스들
export const logger = new Logger('APP');
export const apiLogger = new Logger('API');
export const realtimeLogger = new Logger('Realtime');

// 팩토리 함수 - 커스텀 prefix로 로거 생성
export const createLogger = (prefix: string): Logger => new Logger(prefix);

export default logger;

