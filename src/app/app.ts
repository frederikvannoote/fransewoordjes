import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignaturePadComponent } from './signature-pad/signature-pad'; // Import the component

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SignaturePadComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'fransewoordjes';
  count = 0;

  likeAndSubscribe() {
    this.count++;
    console.log(`Like and subscribe clicked ${this.count} times!`);
  }

  getCount() {
    return this.count;
  }
}
