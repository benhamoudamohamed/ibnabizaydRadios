import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ScheduleElement {
  id: number;
  title: string;
  timeTn: string;
  timeKsa: string;
  photo: string;
  category: string;
  days: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  private readonly destroy$ = new Subject();
  radioSchedule = 'http://www.ibnabizayd.com/api/planning';
  scheduleInfos: any;
  vals: any;
  dayOrder = { الأحد: 1, الإثنين: 2, الثلاثاء: 3, الأربعاء: 4, الخميس: 5, الجمعة: 6, السبت: 7 };
  showSpinner = false

  constructor(public modalCtrl: ModalController, private http: HttpClient) { }

  async ionViewDidEnter() {
    this.getSchedule();
  }

  getSchedule() {
    this.showSpinner = true
    return this.http.get(this.radioSchedule)
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: ScheduleElement) => {
      this.scheduleInfos = data
      this.vals = data;
      this.vals.sort( (a, b) => this.dayOrder[a.category] - this.dayOrder[b.category]);
      this.showSpinner = false
    })
  }

  closeModal() {
    this.modalCtrl.dismiss()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
