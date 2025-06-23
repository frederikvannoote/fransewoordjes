import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordDisplay } from './word-display';

import { VocabularyService, Word } from '../../services/vocabulary.service';
import { of } from 'rxjs'; // Not strictly needed for this version but good for future async service methods
import { CommonModule } from '@angular/common';

// Mock VocabularyService
class MockVocabularyService {
  private _currentWord: Word | undefined = { french: 'chat', dutch: 'kat', successes: 0 };

  getCurrentWord(): Word | undefined {
    return this._currentWord;
  }
  selectNewRandomWord(): Word {
    this._currentWord = { french: 'chien', dutch: 'hond', successes: 1 }; // Simulate selecting a new word
    return this._currentWord;
  }
  // Add other methods if WordDisplay component uses them directly
  getWords = () => [this._currentWord!]; // Example if needed
  updateSuccessCount = (word: Word) => {}; // Example if needed
  getRandomWord = () => this._currentWord!; // To satisfy original implementation if called
}

describe('WordDisplay', () => {
  let component: WordDisplay;
  let fixture: ComponentFixture<WordDisplay>;
  let vocabularyService: VocabularyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordDisplay, CommonModule], // WordDisplay is standalone, CommonModule for *ngIf
      providers: [
        { provide: VocabularyService, useClass: MockVocabularyService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordDisplay);
    component = fixture.componentInstance;
    vocabularyService = TestBed.inject(VocabularyService); // Get the injected service instance
    fixture.detectChanges(); // Initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the Dutch word from VocabularyService on init', () => {
    const h2Element = fixture.nativeElement.querySelector('h2');
    expect(h2Element).toBeTruthy();
    expect(h2Element.textContent).toContain('kat'); // From MockVocabularyService initial word
  });

  it('should display a new Dutch word when showNewWord is called', () => {
    spyOn(vocabularyService, 'selectNewRandomWord').and.callThrough(); // Spy on the mock
    component.showNewWord();
    fixture.detectChanges(); // Update view with new word

    expect(vocabularyService.selectNewRandomWord).toHaveBeenCalled();
    const h2Element = fixture.nativeElement.querySelector('h2');
    expect(h2Element).toBeTruthy();
    expect(h2Element.textContent).toContain('hond'); // New word from mock
  });

  it('should update displayed word when VocabularyService.currentWord changes', () => {
    // Directly simulate service changing the word (e.g. after successful answer)
    (vocabularyService as any)._currentWord = { french: 'souris', dutch: 'muis', successes: 2 };
    fixture.detectChanges();
    const h2Element = fixture.nativeElement.querySelector('h2');
    expect(h2Element.textContent).toContain('muis');
  });

  it('should call vocabularyService.selectNewRandomWord on init if no current word', () => {
    // Need to re-setup for this specific scenario
    TestBed.resetTestingModule();
    const mockServiceWithoutInitialWord = new MockVocabularyService();
    (mockServiceWithoutInitialWord as any)._currentWord = undefined; // Start with no word
    spyOn(mockServiceWithoutInitialWord, 'selectNewRandomWord').and.callThrough();

    TestBed.configureTestingModule({
      imports: [WordDisplay, CommonModule],
      providers: [ { provide: VocabularyService, useValue: mockServiceWithoutInitialWord }]
    }).compileComponents();

    fixture = TestBed.createComponent(WordDisplay);
    component = fixture.componentInstance;
    // fixture.detectChanges() is called by default in `beforeEach`,
    // but here we want to check effect of ngOnInit
    fixture.detectChanges();

    expect(mockServiceWithoutInitialWord.selectNewRandomWord).toHaveBeenCalled();
  });

});
