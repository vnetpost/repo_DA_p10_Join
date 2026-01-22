import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy implements OnInit{
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
