import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: Record<string, any>;
  statusCode: number;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map(data => {
        // Check if data contains pagination meta information
        const isPaginated = data && typeof data === 'object' && 'items' in data && 'meta' in data;
        
        return {
          data: isPaginated ? data.items : data,
          meta: isPaginated ? data.meta : undefined,
          statusCode,
          message: 'Success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
