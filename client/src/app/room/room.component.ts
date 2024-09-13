import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CallService } from '../call.service';

@Component({
  selector: 'wh-room',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements AfterViewInit {
  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  constructor(private callService: CallService) {}

  ngAfterViewInit(): void {
    this.callService.init(this.localVideo, this.remoteVideo);
  }
}
