import { Component, ElementRef, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  imports: [],
  templateUrl: './signature-pad.html',
  styleUrls: ['./signature-pad.css'],
  standalone: true
})
export class SignaturePadComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.signaturePad = new SignaturePad(canvas);
  }

  clearSignature() {
    this.signaturePad.clear(); // Clears the canvas
  }

  saveSignature() {
    if (this.signaturePad.isEmpty()) {
      alert('Please provide a signature first.');
    } else {
      const dataURL = this.signaturePad.toDataURL(); // Converts the signature to a data URL
      console.log('Signature saved:', dataURL); // Logs the signature data URL
    }
  }

  signature() {
    if (this.signaturePad.isEmpty()) {
      alert('Please provide a signature first.');
      return null;
    } else {
      const dataURL = this.signaturePad.toDataURL(); // Converts the signature to a data URL
      return dataURL;
    }
  }
}
