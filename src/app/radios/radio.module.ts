import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RadioComponent } from './radio.component';

@NgModule({
  imports: [ CommonModule, IonicModule],
  declarations: [RadioComponent],
  exports: [RadioComponent]
})
export class RadioModule {}
