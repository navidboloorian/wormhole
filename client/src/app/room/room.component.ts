import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CallService } from '../call.service';
import { RoomService } from '../room.service';

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
    private _callService: CallService,
    private _roomService: RoomService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  async ngOnInit() {
    this.roomId = this._route.snapshot.paramMap.get('id') as string;

    const resp = await this._roomService.getRoom(this.roomId);

    if (!resp.success) {
      this._router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    this._callService.init(
      this.localVideo,
      this.remoteVideo,
      this.videoSelect,
      this.audioSelect,
      this.roomId
    );
  }
}
