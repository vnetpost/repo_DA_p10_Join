import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-page',
  imports: [],
  templateUrl: './help-page.html',
  styleUrl: './help-page.scss',
})
export class HelpPage implements OnInit{
  location = inject(Location);

  ngOnInit(): void {
    const el = document.querySelector('.content-area');
    if (el) {
      el.scrollTop = 0;
    }
  }

  back(): void {
    this.location.back();
  }
}
