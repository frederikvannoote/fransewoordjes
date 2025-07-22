import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignaturePadComponent } from './signature-pad/signature-pad'; // Import the component
import { WordsService } from './words.service'; // Import the WordsService
import { RecognizeService } from './recognize.service'; // Import the RecognizeService
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SignaturePadComponent, MatIconModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Franse woordjes';
  protected text = '';
  count = 0;

  @ViewChild(SignaturePadComponent) signaturePad!: SignaturePadComponent; // Reference to SignaturePadComponent

  constructor(private wordsService: WordsService, private recognizeService: RecognizeService) {} // Inject RecognizeService

  handleImage(apikey: string) {
    console.log('Image handling logic goes here.');

    if (this.signaturePad) {
      const imageData = this.signaturePad.signature();
      if (imageData) {
        console.log('Signature data:', imageData);

        // Convert the image data from base64 to blob
        const byteCharacters = atob(imageData.split(',')[1]); // Decode base64 string
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' }); // Create a Blob object

        this.recognizeService.recognizeImage(blob, apikey).then((response) => {
          console.log('Recognition result:', response);
          console.log('blocks:', response.readResult.blocks.length)
          if (response && response.readResult && 
            response.readResult.blocks && response.readResult.blocks.length > 0) {
            const text = response.readResult.blocks[0].lines.map((line: any) => line.text).join('\n');
            console.log('Recognized text:', text);

            this.text = text;
          } else {
            console.log('No text recognized.');
          }
        }).catch((error) => {
          console.error('Error recognizing image:', error);
        });
      } else {
        console.error('No signature data available.');
      }
    } else {
      console.error('SignaturePadComponent is not available.');
    }
  }

  clear() {
    this.signaturePad.clear(); // Clears the signature pad
  }

  saveWord(key: string, word: string) {
    this.wordsService.saveData(key, word).then(() => {
      console.log(`Word "${word}" saved successfully.`);
    }).catch((error) => {
      console.error('Error saving word:', error);
    });
  }

  loadWord(key: string) {
    this.wordsService.getData(key).then((word) => {
      if (word) {
        console.log(`Loaded word: ${word}`);
      } else {
        console.log(`No word found for key: ${key}`);
      }
    }).catch((error) => {
      console.error('Error loading word:', error);
    });
  }
}
