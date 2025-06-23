import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { WordDisplay } from './components/word-display/word-display';
import { CanvasInput } from './components/canvas-input/canvas-input';
import { VocabularyService, Word } from './services/vocabulary.service';
import { OcrService } from './services/ocr.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core'; // For mocking child components

// Mock Child Components
@Component({ selector: 'app-word-display', template: '<div>Mock Word Display: {{ mockCurrentWord?.dutch }}</div>', standalone: true, imports: [CommonModule] })
class MockWordDisplayComponent {
  // This mock needs to reflect how App interacts with WordDisplay.
  // App doesn't directly call methods on WordDisplay anymore, it relies on VocabularyService.
  // So, this mock is mostly for presence. We can use VocabularyService mock to control the word.
  @Input() mockCurrentWord: Word | undefined;
}

@Component({ selector: 'app-canvas-input', template: '<button (click)="mockSubmit()">Mock Submit Drawing</button>', standalone: true })
class MockCanvasInputComponent {
  @Output() drawingSubmitted = new EventEmitter<string>();
  mockSubmit() {
    this.drawingSubmitted.emit('data:image/png;base64,mockdrawdata');
  }
}

// Mock Services
class MockVocabularyService {
  _currentWord: Word | undefined = { french: 'maison', dutch: 'huis', successes: 0 };
  getCurrentWord = jasmine.createSpy('getCurrentWord').and.callFake(() => this._currentWord);
  selectNewRandomWord = jasmine.createSpy('selectNewRandomWord').and.callFake(() => {
    this._currentWord = { french: 'livre', dutch: 'boek', successes: 1 };
    return this._currentWord;
  });
  updateSuccessCount = jasmine.createSpy('updateSuccessCount');

  // Helper to manually set current word for testing
  setCurrentWord(word: Word | undefined) {
    this._currentWord = word;
  }
}

class MockOcrService {
  apiKey = 'VALID_MOCK_KEY'; // Default to a valid key for most tests
  recognizeImage = jasmine.createSpy('recognizeImage').and.returnValue(of('maison')); // Default success
}


describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let vocabularyService: MockVocabularyService;
  let ocrService: MockOcrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, CommonModule, HttpClientTestingModule], // App imports CommonModule, WordDisplay, CanvasInput
      // We override App's imports with mocks for child components
      // and provide mock services.
    })
    .overrideComponent(App, {
      remove: { imports: [WordDisplay, CanvasInput] },
      add: { imports: [MockWordDisplayComponent, MockCanvasInputComponent] }
    })
    .overrideProvider(VocabularyService, { useClass: MockVocabularyService })
    .overrideProvider(OcrService, { useClass: MockOcrService })
    .compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    vocabularyService = TestBed.inject(VocabularyService) as unknown as MockVocabularyService;
    ocrService = TestBed.inject(OcrService) as unknown as MockOcrService;

    // Set initial word for MockWordDisplayComponent if needed by template
    const mockWordDisplayDebugEl = fixture.debugElement.query(c => c.componentInstance instanceof MockWordDisplayComponent);
    if (mockWordDisplayDebugEl) {
        mockWordDisplayDebugEl.componentInstance.mockCurrentWord = vocabularyService.getCurrentWord();
    }

    fixture.detectChanges(); // Initial data binding
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the title 'French Vocabulary App'`, () => {
    expect(component.title).toEqual('French Vocabulary App');
    const compiled = fixture.nativeElement as HTMLElement;
    // The h1 only contains the title directly now.
    expect(compiled.querySelector('h1')?.textContent).toEqual('French Vocabulary App');
  });

  describe('handleDrawingSubmission', () => {
    const mockImageData = 'data:image/png;base64,mockdrawdata';

    it('should call OCR service and process correct answer', fakeAsync(() => {
      vocabularyService.setCurrentWord({ french: 'chat', dutch: 'kat', successes: 0 });
      ocrService.recognizeImage.and.returnValue(of('chat')); // OCR returns correct word

      component.handleDrawingSubmission(mockImageData);
      tick(); // Resolve observable

      expect(ocrService.recognizeImage).toHaveBeenCalledWith(mockImageData);
      expect(component.isLoadingOcr).toBeFalse();
      expect(component.ocrResult).toBe('chat');
      expect(component.feedbackMessage).toContain('Correct!');
      expect(vocabularyService.updateSuccessCount).toHaveBeenCalledWith(jasmine.objectContaining({ french: 'chat' }));
    }));

    it('should call OCR service and process incorrect answer', fakeAsync(() => {
      const currentWord = { french: 'chien', dutch: 'hond', successes: 0 };
      vocabularyService.setCurrentWord(currentWord);
      ocrService.recognizeImage.and.returnValue(of('chat')); // OCR returns different word

      component.handleDrawingSubmission(mockImageData);
      tick();

      expect(ocrService.recognizeImage).toHaveBeenCalledWith(mockImageData);
      expect(component.isLoadingOcr).toBeFalse();
      expect(component.ocrResult).toBe('chat');
      expect(component.feedbackMessage).toContain('Not quite');
      expect(component.feedbackMessage).toContain(`"${currentWord.french}"`);
      expect(vocabularyService.updateSuccessCount).not.toHaveBeenCalled();
    }));

    it('should handle OCR service error', fakeAsync(() => {
      ocrService.recognizeImage.and.returnValue(throwError(() => new Error('OCR API Failed')));

      component.handleDrawingSubmission(mockImageData);
      tick();

      expect(component.isLoadingOcr).toBeFalse();
      expect(component.feedbackMessage).toContain('Failed to get OCR result');
      expect(component.feedbackMessage).toContain('OCR API Failed');
    }));

    it('should display message if no current word is selected', () => {
      vocabularyService.setCurrentWord(undefined); // No word selected
      component.handleDrawingSubmission(mockImageData);
      expect(ocrService.recognizeImage).not.toHaveBeenCalled();
      expect(component.feedbackMessage).toContain('Error: No word is currently selected');
      expect(component.isLoadingOcr).toBeFalse();
    });

    it('should display message and not call OCR if API key is placeholder', () => {
      ocrService.apiKey = 'YOUR_API_KEY'; // Simulate placeholder
      vocabularyService.setCurrentWord({ french: 'test', dutch: 'test', successes: 0 });

      component.handleDrawingSubmission(mockImageData);

      expect(ocrService.recognizeImage).not.toHaveBeenCalled();
      expect(component.feedbackMessage).toContain('OCR functionality is disabled');
      expect(component.ocrResult).toBe('N/A (API Key Missing)');
      expect(component.isLoadingOcr).toBeFalse();
      ocrService.apiKey = 'VALID_MOCK_KEY'; // Reset for other tests
    });

    it('should handle null OCR result (text not recognized)', fakeAsync(() => {
      vocabularyService.setCurrentWord({ french: 'arbre', dutch: 'boom', successes: 0 });
      ocrService.recognizeImage.and.returnValue(of(null));

      component.handleDrawingSubmission(mockImageData);
      tick();

      expect(component.ocrResult).toBeNull();
      expect(component.feedbackMessage).toContain('OCR could not recognize any text');
      expect(vocabularyService.updateSuccessCount).not.toHaveBeenCalled();
    }));
  });

  describe('showNewWord', () => {
    it('should call vocabularyService.selectNewRandomWord and clear feedback', () => {
      component.feedbackMessage = 'Some feedback';
      component.ocrResult = 'Some OCR text';

      component.showNewWord();

      expect(vocabularyService.selectNewRandomWord).toHaveBeenCalled();
      expect(component.feedbackMessage).toBeNull();
      expect(component.ocrResult).toBeNull();

      // Also update the mock word display component's input for template check
      const mockWordDisplayDebugEl = fixture.debugElement.query(c => c.componentInstance instanceof MockWordDisplayComponent);
      if (mockWordDisplayDebugEl) {
          mockWordDisplayDebugEl.componentInstance.mockCurrentWord = vocabularyService.getCurrentWord();
      }
      fixture.detectChanges(); // To reflect new word in mock word display if it were bound
      // Example check if template updates (assuming mock component reflects the change)
      // const wordDisplayEl = fixture.nativeElement.querySelector('app-word-display div');
      // expect(wordDisplayEl.textContent).toContain('boek'); // New word from service mock
    });
  });

  it('should disable "Next Word" button while OCR is loading', fakeAsync(() => {
    vocabularyService.setCurrentWord({ french: 'chat', dutch: 'kat', successes: 0 });
    ocrService.recognizeImage.and.callFake(() => {
      component.isLoadingOcr = true; // Simulate service setting this (though component does it)
      fixture.detectChanges(); // Update view for disabled state
      const nextButton = fixture.nativeElement.querySelector('.next-word-button');
      expect(nextButton.disabled).toBeTrue();
      return of('chat').pipe(
        // delay(1) // Simulate async operation if needed for more complex scenarios
      );
    });

    component.handleDrawingSubmission('mock-data');
    // isLoadingOcr is true now
    fixture.detectChanges();
    let nextButton = fixture.nativeElement.querySelector('.next-word-button');
    expect(nextButton.disabled).toBeTrue();

    tick(); // Complete the OCR call
    fixture.detectChanges(); // Reflect that isLoadingOcr is false
    nextButton = fixture.nativeElement.querySelector('.next-word-button');
    expect(nextButton.disabled).toBeFalse();
  }));

});
