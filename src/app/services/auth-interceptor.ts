import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ตรวจสอบว่า request นี้ใช้ cookie-based authentication หรือไม่
  const isCookieBasedAuth = req.url.includes('/api/AddressMetadata') || 
                           req.url.includes('/api/CustomerMetadata') || 
                           req.url.includes('/api/StockMetadata') ||
                           req.url.includes('/api/Customer') ||
                           req.url.includes('/api/Address') ||
                           req.url.includes('/api/Dividend');

  // ถ้าใช้ cookie-based authentication ให้ข้าม interceptor
  if (isCookieBasedAuth) {
    return next(req);
  }

  // สำหรับ API อื่นๆ ที่ใช้ token-based authentication
  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('token')
    : null;

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
