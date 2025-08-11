// thai-number-text.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiNumberText',
})
export class ThaiNumberTextPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return '';

    const thNumberText = [
      '', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า',
    ];
    const thDigitText = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

    const text = (n: number): string => {
      let str = '';
      const numStr = n.toString();
      const len = numStr.length;

      for (let i = 0; i < len; i++) {
        const digit = +numStr[i];
        const pos = len - i - 1;

        if (digit === 0) continue;

        if (pos === 0 && digit === 1 && len > 1) {
          str += 'เอ็ด';
        } else if (pos === 1 && digit === 2) {
          str += 'ยี่';
        } else if (pos === 1 && digit === 1) {
          str += '';
        } else {
          str += thNumberText[digit];
        }

        str += thDigitText[pos];
      }

      return str;
    };

    return text(num) + 'หุ้น';
  }
}
