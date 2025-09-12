import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request และบังคับให้ส่ง cookie
  const clonedReq = req.clone({
    withCredentials: true
  });
  return next(clonedReq);
};
