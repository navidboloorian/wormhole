import { Component } from '@angular/core';
import { RoomFormComponent } from '../room-form/room-form.component';

@Component({
  selector: 'wh-home',
  standalone: true,
  imports: [RoomFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
