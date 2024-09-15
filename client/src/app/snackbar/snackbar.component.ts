import { NgIf } from '@angular/common';
import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'wh-snackbar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
  @Input() message: string;
  @Input() type: 'error' | 'success';

  @ViewChild('snackbar') snackbar: ElementRef;
}
