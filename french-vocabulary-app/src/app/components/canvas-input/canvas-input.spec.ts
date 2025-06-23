import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasInput } from './canvas-input';

import { ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('CanvasInput', () => {
  let component: CanvasInput;
  let fixture: ComponentFixture<CanvasInput>;
  let canvasEl: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasInput, CommonModule] // CanvasInput is standalone
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasInput);
    component = fixture.componentInstance;

    // Mock the canvas element and context before ngAfterViewInit is called
    // by fixture.detectChanges()
    canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 200;
    // getContext will be mocked further down if specific canvas calls need spying.
    // For basic setup, a real context (if available in test env) or a simple mock is fine.
    // JSDOM (used by Angular tests) doesn't implement canvas rendering, so we mock methods.
    context = canvasEl.getContext('2d')!;
    if (!context) { // Fallback for environments where getContext('2d') might return null
        context = {
            beginPath: jasmine.createSpy('beginPath'),
            moveTo: jasmine.createSpy('moveTo'),
            lineTo: jasmine.createSpy('lineTo'),
            stroke: jasmine.createSpy('stroke'),
            clearRect: jasmine.createSpy('clearRect'),
            // Add any other CanvasRenderingContext2D methods used by the component
        } as unknown as CanvasRenderingContext2D;
    }


    component.canvasRef = new ElementRef<HTMLCanvasElement>(canvasEl);
    spyOn(component.canvasRef.nativeElement, 'getContext').and.returnValue(context);

    fixture.detectChanges(); // This calls ngAfterViewInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize canvas context in ngAfterViewInit', () => {
    expect(component.canvasRef.nativeElement.getContext).toHaveBeenCalledWith('2d');
    expect((component as any).context).toBeDefined();
    expect((component as any).context.lineWidth).toBe(3);
    expect((component as any).context.lineCap).toBe('round');
    expect((component as any).context.strokeStyle).toBe('black');
  });

  it('should start drawing on mousedown', () => {
    spyOn(context, 'beginPath');
    spyOn(context, 'moveTo');
    const mockEvent = { clientX: 10, clientY: 20 } as MouseEvent;
    spyOnProperty(canvasEl, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, right: 0, bottom: 0, width: 400, height: 200 } as DOMRect);


    component.startDrawing(mockEvent);

    expect((component as any).isDrawing).toBeTrue();
    expect(context.beginPath).toHaveBeenCalled();
    expect(context.moveTo).toHaveBeenCalledWith(10, 20);
  });

  it('should draw on mousemove if isDrawing is true', () => {
    (component as any).isDrawing = true; // Set drawing state
    spyOn(context, 'lineTo');
    spyOn(context, 'stroke');
    const mockEvent = { clientX: 15, clientY: 25 } as MouseEvent;
    spyOnProperty(canvasEl, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, right: 0, bottom: 0, width: 400, height: 200 } as DOMRect);


    component.draw(mockEvent);

    expect(context.lineTo).toHaveBeenCalledWith(15, 25);
    expect(context.stroke).toHaveBeenCalled();
  });

  it('should not draw on mousemove if isDrawing is false', () => {
    (component as any).isDrawing = false;
    spyOn(context, 'lineTo');
    const mockEvent = { clientX: 15, clientY: 25 } as MouseEvent;
    component.draw(mockEvent);
    expect(context.lineTo).not.toHaveBeenCalled();
  });

  it('should stop drawing on mouseup', () => {
    (component as any).isDrawing = true;
    component.stopDrawing();
    expect((component as any).isDrawing).toBeFalse();
  });

  it('should stop drawing on mouseleave', () => {
    // This test is for the (mouseleave) event binding in the template
    (component as any).isDrawing = true; // Simulate drawing started
    const canvasDebugEl = fixture.debugElement.query(p => p.name === 'canvas');
    canvasDebugEl.triggerEventHandler('mouseleave', null);
    fixture.detectChanges();
    expect((component as any).isDrawing).toBeFalse();
  });

  it('should clear the canvas', () => {
    spyOn(context, 'clearRect');
    component.clearCanvas();
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, canvasEl.width, canvasEl.height);
  });

  it('should emit drawingSubmitted event with image data URL and clear canvas on submitDrawing', () => {
    spyOn(component.drawingSubmitted, 'emit');
    spyOn(component, 'clearCanvas'); // Spy on the component's clearCanvas method
    const mockDataUrl = 'data:image/png;base64,mockedImageData';
    spyOn(canvasEl, 'toDataURL').and.returnValue(mockDataUrl);

    component.submitDrawing();

    expect(canvasEl.toDataURL).toHaveBeenCalledWith('image/png');
    expect(component.drawingSubmitted.emit).toHaveBeenCalledWith(mockDataUrl);
    expect(component.clearCanvas).toHaveBeenCalled();
  });

  // Test touch events (similar to mouse events)
  it('should start drawing on touchstart', () => {
    spyOn(context, 'beginPath');
    spyOn(context, 'moveTo');
    const mockTouchEvent = { touches: [{ clientX: 30, clientY: 40 }] } as unknown as TouchEvent;
    spyOnProperty(canvasEl, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, right: 0, bottom: 0, width: 400, height: 200 } as DOMRect);

    component.startDrawing(mockTouchEvent);

    expect((component as any).isDrawing).toBeTrue();
    expect(context.beginPath).toHaveBeenCalled();
    expect(context.moveTo).toHaveBeenCalledWith(30, 40); // Check coordinates
  });

  it('should draw on touchmove if isDrawing is true', () => {
    (component as any).isDrawing = true;
    spyOn(context, 'lineTo');
    spyOn(context, 'stroke');
    const mockTouchEvent = { touches: [{ clientX: 35, clientY: 45 }] } as unknown as TouchEvent;
    spyOnProperty(canvasEl, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, right: 0, bottom: 0, width: 400, height: 200 } as DOMRect);

    component.draw(mockTouchEvent);

    expect(context.lineTo).toHaveBeenCalledWith(35, 45);
    expect(context.stroke).toHaveBeenCalled();
  });

  it('should stop drawing on touchend', () => {
    (component as any).isDrawing = true;
    component.stopDrawing(); // stopDrawing is generic for mouse/touch end
    expect((component as any).isDrawing).toBeFalse();
  });

});
