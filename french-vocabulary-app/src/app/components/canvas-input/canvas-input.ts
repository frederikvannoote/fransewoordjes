import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-canvas-input',
  imports: [CommonModule],
  templateUrl: './canvas-input.html',
  styleUrl: './canvas-input.css'
})
export class CanvasInput implements AfterViewInit {
  @ViewChild('drawingCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() drawingSubmitted = new EventEmitter<string>();

  private context!: CanvasRenderingContext2D;
  private isDrawing = false;

  ngAfterViewInit(): void {
    this.context = this.canvasRef.nativeElement.getContext('2d')!;
    this.context.lineWidth = 3;
    this.context.lineCap = 'round';
    this.context.strokeStyle = 'black';
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const coords = this.getCoordinates(event);
    this.context.beginPath();
    this.context.moveTo(coords.x, coords.y);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    const coords = this.getCoordinates(event);
    this.context.lineTo(coords.x, coords.y);
    this.context.stroke();
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  submitDrawing(): void {
    const imageDataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.drawingSubmitted.emit(imageDataUrl);
    this.clearCanvas();
  }

  private getCoordinates(event: MouseEvent | TouchEvent): { x: number, y: number } {
    let clientX, clientY;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
}
