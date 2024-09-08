import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  localVideo: ElementRef;

  constructor() {}

  async initLocalVideo(localVideo: ElementRef) {
    this.localVideo = localVideo;
    const videoElement = localVideo.nativeElement as HTMLVideoElement;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoElement.srcObject = stream;
      videoElement.play();
    } catch (error) {
      console.error(error);
    }
  }
}
