import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Platform, ToastController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { BatteryStatus } from '@ionic-native/battery-status/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

// const shell = require('electron').shell

export enum ConnectionStatus {
  Online,
  Offline
}
export interface TrackTitle {
  current_track?: {
    title?: string;
  };
}

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
})
export class RadioComponent {

  @Input() radioStreamLink: string;
  @Input() radioStatus: string;

  private readonly destroy$ = new Subject();
  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);
  networkStatus: number;
  batteryStatusSubscription: any

  metadata: any = 'إذاعة ابن أبي زيد القيرواني';
  trackTitle: TrackTitle = { current_track: {} };
  audio = new Audio();
  playIcon = 'play';
  currentPosition: number
  playInterval: any
  counter: number = 0
  isplaying = false;
  showSpinner = false

  connected = 'تم الإتصال بالشبكة بنجاح'
  notconnected = 'لا يوجد إتصال بالإنترنت'
  batteryLevel = 'الرجاء شحن بطارية الهاتف'
  radioName = 'إذاعة ابن أبي زيد القيرواني';
  radioSubName = 'كتاب وسنة على فهم سلف الأمة';

  Mode: any
  watchEvent

  opensite() {

   //window.open("http://google.com",'_blank', 'location=yes');



   //shell.openExternal('https://github.com')


  //  const aTags = document.getElementsByTagName("a");
  //  for (var i = 0; i < aTags.length; i++) {
  //    aTags[i].setAttribute("onclick","require('Shell').openExternal('" + aTags[i].href + "')");
  //    aTags[i].href = "#";
  //  }






    // const openCapacitorSite = async () => {
    //   await Browser.open({ url: 'https://ionicframework.com/', windowName: "_blank" });
    // };

    // const browser = this.iab.create('https://ionicframework.com/', '_blank', 'location=yes');
    // browser.show()

    // browser.close()
  }

  constructor(private platform: Platform, private iab: InAppBrowser,
    private http: HttpClient,
    private router: Router,
    private network: Network,
    private batteryStatus: BatteryStatus,
    private backgroundMode: BackgroundMode,
    private batteryStatusToast: ToastController,
    private onlineToast: ToastController,
    private offlineToast: ToastController) {



      if (this.platform.is('electron')) {
        console.log('I AM ELECTRON');
        this.Mode = 'electron'
      }
      if(this.platform.is('desktop') ) {
        console.log('I AM desktop');
        this.Mode = 'desktop'
      }
      if(this.platform.is('cordova') ) {
        console.log('I AM cordova');
        this.Mode = 'cordova'
      }
      if(this.platform.is('capacitor') ) {
        console.log('I AM capacitor');
        this.Mode = 'capacitor'
      }
     //"cordova" | "capacitor" | "electron"   "desktop" | "hybrid"

    this.platform.ready().then(async () => {

      this.router.events.forEach((event) => {
        if(event instanceof NavigationStart) {
          this.pauseTrack()
        }
      });

      this.getTrackTitle()

      this.backgroundMode.enable();
      this.backgroundMode.on("activate").subscribe(()=>{
        this.backgroundMode.disableBatteryOptimizations()
      });

      let status =  this.network.type === 'none' ? ConnectionStatus.Offline : ConnectionStatus.Online;
      this.status.next(status);
      this.networkStatus = status

      if(this.networkStatus === 1) {
        this.updateNetworkStatus(ConnectionStatus.Offline);
      } else {
        this.updateNetworkStatus(ConnectionStatus.Online);
      }

      setInterval(() => {
        this.initializeNetworkEvents();
        if(this.networkStatus === 1) {
          this.pauseTrack()
        } else {
          this.getTrackTitle()
        }
        this.batteryStatusSubscription = this.batteryStatus.onChange().subscribe(status => {
          if(status.level <= 10) {
            this.batteryStatusToast.create({
              message: `%${status.level} <ion-icon slot="start" name="battery-dead"></ion-icon> ${this.batteryLevel}`,
              cssClass: 'batteryStatusController',
              position: 'top',
              color: 'danger',
            }).then((toast1) => {
              toast1.present();
            });
          }
          else {
            this.batteryStatusToast.dismiss()
          }
        });
      }, 5000)
    });
  }

  getTrackTitle() {
    return this.http.get(this.radioStatus)
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: any) => {
      this.metadata = data.current_track.title
    })
  }

  playTrack() {
    this.isplaying = true;
    this.showSpinner = true;
    this.audio.src = this.radioStreamLink;
    this.audio.load();
    this.audio.play();
    this.playInterval = setInterval(() => {
      this.counter++
      this.currentPosition = this.audio.currentTime;
      if(this.currentPosition > 0) {
        this.showSpinner = false;
       clearInterval(this.playInterval)
      }
    }, 1000);
  }
  pauseTrack() {
    this.audio.pause()
    this.isplaying = false;
    this.showSpinner = false;
    this.counter = 0
    this.audio.currentTime = 0
  }

  public initializeNetworkEvents() {
    this.network.onDisconnect()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Online) {
        this.updateNetworkStatus(ConnectionStatus.Offline);
      }
    });
    this.network.onConnect()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Offline) {
        this.updateNetworkStatus(ConnectionStatus.Online);
      }
    });
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);
    this.networkStatus = status

    if(this.networkStatus === 1) {
      this.offlineToast.create({
        message: `${this.notconnected} <ion-icon slot="end" name="warning"></ion-icon>`,
        cssClass: 'toastController',
        position: 'top',
        color: 'danger',
      }).then((toast2) => {
        toast2.present();
      });
    }
    if(this.networkStatus !== 1) {
      this.onlineToast.create({
        message: `${this.connected} <ion-icon slot="end" size="large" name="information-circle"></ion-icon>`,
        cssClass: 'toastController',
        position: 'top',
        color: 'dark',
        duration: 3000,
      }).then((toast1) => {
        toast1.present();
      });
      this.offlineToast.dismiss();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.batteryStatusSubscription.unsubscribe();
  }
}
