import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return data;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(
          JSON.stringify(data, (key, value) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return typeof value === 'bigint' ? value.toString() : value;
          }),
        );
      }),
    );
  }
}
