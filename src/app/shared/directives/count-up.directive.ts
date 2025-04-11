import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnChanges {
  @Input() formatCurrency: boolean = true;
  @Input() appCountUp: number = 0;
  @Input() duration: number = 1000;
  @Input() useSuffix: boolean = false;
  @Input() currency: string = 'USD'; // Moneda por defecto
  @Input() locale: string = 'en-US'; // Localización por defecto

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appCountUp']) {
      this.animateCount(this.appCountUp, this.duration);
    }
  }

  animateCount(endValue: number, duration: number) {
    const start = 0;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = progress * (endValue - start) + start;

      this.el.nativeElement.textContent = this.formatValue(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  private formatValue(value: number): string {
    if (this.formatCurrency) {
      const formatter = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  
      if (this.useSuffix) {
        if (value >= 1_000_000) return formatter.format(value / 1_000_000) + 'M';
        if (value >= 1_000) return formatter.format(value / 1_000) + 'K';
      }
  
      return formatter.format(value);
    }
  
    // Solo número sin moneda
    if (this.useSuffix) {
      if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
      if (value >= 1_000) return (value / 1_000).toFixed(2) + 'K';
    }
  
    return Math.floor(value).toLocaleString(this.locale);
  }
  
}
