import fs from 'fs';
import path from 'path';
import logger from './logger';

/**
 * Interfaz para métricas de logs
 */
interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
  httpCount: number;
  timeRange: {
    start: string;
    end: string;
  };
  topErrors: Array<{
    message: string;
    count: number;
  }>;
  topIPs: Array<{
    ip: string;
    count: number;
  }>;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    avgResponseTime: number;
  }>;
  slowRequests: Array<{
    endpoint: string;
    responseTime: number;
    timestamp: string;
  }>;
}

/**
 * Interfaz para estadísticas de autenticación
 */
interface AuthStats {
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  topFailedIPs: Array<{
    ip: string;
    count: number;
  }>;
  loginTrends: Array<{
    hour: number;
    attempts: number;
    successes: number;
  }>;
}

/**
 * Analizador de logs
 */
export class LogAnalyzer {
  private logDir: string;

  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
  }

  /**
   * Analizar logs de un archivo específico
   */
  async analyzeLogFile(filename: string): Promise<LogMetrics> {
    const filePath = path.join(this.logDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo de log no encontrado: ${filename}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());

    const metrics: LogMetrics = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      httpCount: 0,
      timeRange: {
        start: '',
        end: '',
      },
      topErrors: [],
      topIPs: [],
      topEndpoints: [],
      slowRequests: [],
    };

    const errorMap = new Map<string, number>();
    const ipMap = new Map<string, number>();
    const endpointMap = new Map<string, { count: number; totalTime: number }>();
    const timestamps: string[] = [];

    for (const line of lines) {
      try {
        const logEntry = this.parseLogLine(line);
        if (!logEntry) continue;

        metrics.totalLogs++;
        timestamps.push(logEntry.timestamp);

        switch (logEntry.level) {
          case 'ERROR':
            metrics.errorCount++;
            break;
          case 'WARN':
            metrics.warningCount++;
            break;
          case 'INFO':
            metrics.infoCount++;
            break;
          case 'DEBUG':
            metrics.debugCount++;
            break;
          case 'HTTP':
            metrics.httpCount++;
            break;
        }

        if (logEntry.level === 'ERROR' && logEntry.message) {
          const errorKey = logEntry.message;
          errorMap.set(errorKey, (errorMap.get(errorKey) || 0) + 1);
        }

        if (logEntry.ip) {
          ipMap.set(logEntry.ip, (ipMap.get(logEntry.ip) || 0) + 1);
        }

        if (logEntry.url && logEntry.responseTime) {
          const endpoint = logEntry.url;
          const current = endpointMap.get(endpoint) || { count: 0, totalTime: 0 };
          current.count++;
          current.totalTime += logEntry.responseTime;
          endpointMap.set(endpoint, current);

          if (logEntry.responseTime > 1000) {
            metrics.slowRequests.push({
              endpoint,
              responseTime: logEntry.responseTime,
              timestamp: logEntry.timestamp,
            });
          }
        }
      } catch (error) {
        logger.warn('Error parsing log line', {
          line: line.substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (timestamps.length > 0) {
      timestamps.sort();
      metrics.timeRange.start = timestamps[0];
      metrics.timeRange.end = timestamps[timestamps.length - 1];
    }

    metrics.topErrors = Array.from(errorMap.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    metrics.topIPs = Array.from(ipMap.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    metrics.topEndpoints = Array.from(endpointMap.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        avgResponseTime: Math.round(data.totalTime / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    metrics.slowRequests.sort((a, b) => b.responseTime - a.responseTime);

    return metrics;
  }

  /**
   * Analizar estadísticas de autenticación
   */
  async analyzeAuthStats(): Promise<AuthStats> {
    const authLogPath = path.join(this.logDir, 'auth.log');

    if (!fs.existsSync(authLogPath)) {
      throw new Error('Archivo de log de autenticación no encontrado');
    }

    const content = fs.readFileSync(authLogPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());

    const stats: AuthStats = {
      totalAttempts: 0,
      successfulLogins: 0,
      failedLogins: 0,
      uniqueUsers: 0,
      topFailedIPs: [],
      loginTrends: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        attempts: 0,
        successes: 0,
      })),
    };

    const failedIPMap = new Map<string, number>();
    const userSet = new Set<string>();

    for (const line of lines) {
      try {
        const logEntry = this.parseLogLine(line);
        if (!logEntry || !logEntry.message) continue;

        if (
          logEntry.message.includes('LOGIN_ATTEMPT') ||
          logEntry.message.includes('REGISTER_ATTEMPT')
        ) {
          stats.totalAttempts++;

          const isSuccess = logEntry.success === true;
          const username = logEntry.username || 'unknown';
          const ip = logEntry.ip || 'unknown';
          const timestamp = new Date(logEntry.timestamp);
          const hour = timestamp.getHours();

          userSet.add(username);

          if (isSuccess) {
            stats.successfulLogins++;
            stats.loginTrends[hour].successes++;
          } else {
            stats.failedLogins++;
            failedIPMap.set(ip, (failedIPMap.get(ip) || 0) + 1);
          }

          stats.loginTrends[hour].attempts++;
        }
      } catch (error) {
        logger.warn('Error parsing auth log line', {
          line: line.substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    stats.uniqueUsers = userSet.size;

    stats.topFailedIPs = Array.from(failedIPMap.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Generar reporte de logs
   */
  async generateReport(): Promise<string> {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        combined: await this.analyzeLogFile('combined.log'),
        error: await this.analyzeLogFile('error.log'),
        http: await this.analyzeLogFile('http.log'),
        auth: await this.analyzeAuthStats(),
      };

      const reportPath = path.join(this.logDir, `report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      logger.info('Log report generated', { reportPath });

      return reportPath;
    } catch (error) {
      logger.error('Error generating log report', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Limpiar logs antiguos
   */
  async cleanupOldLogs(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    const files = fs.readdirSync(this.logDir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);

      if (Date.now() - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
        logger.info('Deleted old log file', { file });
      }
    }

    return deletedCount;
  }

  /**
   * Parsear una línea de log
   */
  private parseLogLine(line: string): any {
    try {
      const jsonMatch = line.match(/\{.*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      const logMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\d{3}) \[(\w+)\]: (.+)/);
      if (logMatch) {
        const [, timestamp, level, message] = logMatch;
        return { timestamp, level, message };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener estadísticas rápidas
   */
  async getQuickStats(): Promise<{
    totalLogs: number;
    errorRate: number;
    avgResponseTime: number;
    activeUsers: number;
  }> {
    try {
      const combined = await this.analyzeLogFile('combined.log');
      const http = await this.analyzeLogFile('http.log');
      const auth = await this.analyzeAuthStats();

      const errorRate =
        combined.totalLogs > 0 ? (combined.errorCount / combined.totalLogs) * 100 : 0;
      const avgResponseTime =
        http.topEndpoints.length > 0
          ? http.topEndpoints.reduce((sum, ep) => sum + ep.avgResponseTime, 0) /
            http.topEndpoints.length
          : 0;

      return {
        totalLogs: combined.totalLogs,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        activeUsers: auth.uniqueUsers,
      };
    } catch (error) {
      logger.error('Error getting quick stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        totalLogs: 0,
        errorRate: 0,
        avgResponseTime: 0,
        activeUsers: 0,
      };
    }
  }
}

export default new LogAnalyzer();
