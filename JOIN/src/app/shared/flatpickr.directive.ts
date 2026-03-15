import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import type { Options } from 'flatpickr/dist/types/options';

/**
 * Attaches a configured Flatpickr date picker to native input elements.
 */
@Directive({
  selector: 'input[appFlatpickr]',
  standalone: true,
})
export class FlatpickrDirective implements OnInit, OnDestroy {
  @Input() fpOptions: Partial<Options> = {};
  private instance?: FlatpickrInstance;

  /**
   * Stores the native input reference used by Flatpickr.
   */
  constructor(private el: ElementRef<HTMLInputElement>) {}

  /**
   * Creates the Flatpickr instance once the host input is ready.
   */
  ngOnInit(): void {
    this.instance = flatpickr(this.el.nativeElement, {
      dateFormat: 'Y/m/d',
      allowInput: false,
      disableMobile: true,
      ...this.fpOptions,
    });
  }

  /**
   * Destroys the Flatpickr instance to avoid leaked listeners.
   */
  ngOnDestroy(): void {
    this.instance?.destroy();
  }
}
