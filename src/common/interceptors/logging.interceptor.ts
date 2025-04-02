import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, originalUrl, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    
    const now = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (res: any) => {
          const response = ctx.getResponse();
          const responseTime = Date.now() - now;
          
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} ${responseTime}ms - ${userAgent} ${ip}`,
          );
        },
        error: (error: any) => {
          const response = ctx.getResponse();
          const responseTime = Date.now() - now;
          
          this.logger.error(
            `${method} ${originalUrl} ${response?.statusCode || 500} ${responseTime}ms - ${userAgent} ${ip}`,
            error.stack,
          );
        },
      }),
    );
  }
}
