import { ElementRef, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  localVideo: ElementRef;
  remoteVideo: ElementRef;
  videoSelect: ElementRef;
  audioSelect: ElementRef;
  selectedVideoId: string;
  selectedAudioId: string;

  webSocket: WebSocket;
  peerConnection: RTCPeerConnection;
  polite: boolean;
  makingOffer: boolean;

  public async init(
    localVideo: ElementRef,
    remoteVideo: ElementRef,
    videoSelect: ElementRef,
    audioSelect: ElementRef
  ) {
    this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.videoSelect = videoSelect;
    this.audioSelect = audioSelect;
    this.polite = false;
    this.makingOffer = false;

    // get perms so that we can access labels in select
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    this._initConnection();
    await this._initSelect('videoinput');
    await this._initSelect('audioinput');
    this._initLocalVideo();
    this._registerListeners();
  }

  private _initConnection() {
    this.webSocket = new WebSocket(`ws://${environment.apiUrl}/ws`);
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
      ],
    };

    this.peerConnection = new RTCPeerConnection(configuration);
  }

  private _initSelect = async (type: 'audioinput' | 'videoinput') => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((device) => device.kind == type);

    const select =
      type === 'audioinput'
        ? this.audioSelect.nativeElement
        : this.videoSelect.nativeElement;

    for (const input of inputs) {
      const option = document.createElement('option');

      option.value = input.deviceId;
      option.innerHTML = input.label;

      select.appendChild(option);
    }

    type === 'audioinput'
      ? (this.selectedAudioId = inputs[0].deviceId)
      : (this.selectedVideoId = inputs[0].deviceId);
  };

  private _initLocalVideo = async () => {
    try {
      const localVideo = this.localVideo.nativeElement as HTMLVideoElement;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: this.selectedAudioId },
        video: { deviceId: this.selectedVideoId },
      });

      for (const track of stream.getTracks()) {
        this.peerConnection.addTrack(track, stream);
      }

      localVideo.srcObject = stream;
      localVideo.play();
    } catch (err) {
      console.error(err);
    }
  };

  private _registerListeners = () => {
    this.audioSelect.nativeElement.onchange = () => {
      this.selectedAudioId = this.audioSelect.nativeElement.value;

      this._initLocalVideo();
    };

    this.videoSelect.nativeElement.onchange = () => {
      this.selectedVideoId = this.videoSelect.nativeElement.value;

      this._initLocalVideo();
    };

    this.peerConnection.ontrack = ({ track, streams }) => {
      const remoteVideo = this.remoteVideo.nativeElement as HTMLVideoElement;

      track.onmute = () => {
        if (remoteVideo.srcObject) return;
      };

      remoteVideo.srcObject = streams[0];
      remoteVideo.play();
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log(this.peerConnection.connectionState);
    };

    this.peerConnection.onicecandidate = ({ candidate }) => {
      this.webSocket.send(JSON.stringify({ candidate }));
    };

    this.peerConnection.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true;

        await this.peerConnection.setLocalDescription();
        this.webSocket.send(
          JSON.stringify({ description: this.peerConnection.localDescription })
        );
      } catch (err) {
        this.makingOffer = false;
      } finally {
        this.makingOffer = false;
      }
    };

    this.webSocket.onmessage = async (message) => {
      console.log(message.data);

      const { polite, description, candidate } = JSON.parse(message.data);
      let ignoreOffer = false;

      if (polite !== undefined) this.polite = polite;

      try {
        if (description) {
          const offerCollision =
            description.type === 'offer' &&
            (this.makingOffer ||
              this.peerConnection.signalingState !== 'stable');

          ignoreOffer = !this.polite && offerCollision;

          console.log(description.type);

          if (ignoreOffer) return;

          await this.peerConnection.setRemoteDescription(description);

          if (description.type === 'offer') {
            await this.peerConnection.setLocalDescription();

            console.log(this.peerConnection.localDescription);
            this.webSocket.send(
              JSON.stringify({
                description: this.peerConnection.localDescription,
              })
            );
          }
        } else if (candidate) {
          try {
            await this.peerConnection.addIceCandidate(candidate);
          } catch (err) {
            console.error(err);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  };
}
