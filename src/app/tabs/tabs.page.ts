import { Component } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ModalController } from '@ionic/angular';
import { Tab2Page } from '../tab2/tab2.page';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private screenOrientation: ScreenOrientation, public modalController: ModalController) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: Tab2Page,
      swipeToClose: true,
      cssClass: 'modalController'
    });
    return await modal.present();
  }
}
