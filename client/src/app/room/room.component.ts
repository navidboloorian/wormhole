import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  @ViewChild('videoSelect') videoSelect: ElementRef;
  @ViewChild('audioSelect') audioSelect: ElementRef;

  roomId: string;

  constructor(
    private callService: CallService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') as string;
  }

  ngAfterViewInit() {
    this.callService.init(
      this.localVideo,
      this.remoteVideo,
      this.videoSelect,
      this.audioSelect,
      this.roomId
    );
  }
}
