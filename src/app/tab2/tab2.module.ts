import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { RadioModule } from '../radios/radio.module';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { ModalPipe } from './modal.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RadioModule,
    Tab2PageRoutingModule
  ],
  declarations: [Tab2Page, ModalPipe]
})
export class Tab2PageModule {}
