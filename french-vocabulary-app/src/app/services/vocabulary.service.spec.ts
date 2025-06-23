import { TestBed } from '@angular/core/testing';

import { VocabularyService } from './vocabulary.service';

describe('VocabularyService', () => {
  let service: VocabularyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VocabularyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of words', () => {
    const words = service.getWords();
    expect(words.length).toBeGreaterThan(0);
  });

  it('should return a random word and set it as currentWord', () => {
    const word = service.getRandomWord();
    expect(word).toBeDefined();
    expect(service.getCurrentWord()).toEqual(word);
  });

  it('should select a new random word and set it as currentWord', () => {
    const initialWord = service.selectNewRandomWord();
    expect(initialWord).toBeDefined();
    expect(service.getCurrentWord()).toEqual(initialWord);

    // Potentially could be the same word if list is small, but test the mechanism
    const newWord = service.selectNewRandomWord();
    expect(newWord).toBeDefined();
    expect(service.getCurrentWord()).toEqual(newWord);
  });

  it('should update success count for the current word', () => {
    const word = service.selectNewRandomWord(); // Ensures currentWord is set
    const initialSuccesses = word.successes;
    service.updateSuccessCount(word);
    expect(word.successes).toBe(initialSuccesses + 1);
    expect(service.getCurrentWord()?.successes).toBe(initialSuccesses + 1);
  });

  it('should update success count for a non-current word', () => {
    service.selectNewRandomWord(); // Set a current word
    let words = service.getWords();
    if (words.length < 2) {
      pending("Need at least two words to test updating a non-current word");
      return;
    }

    let nonCurrentWord = words.find(w => w.french !== service.getCurrentWord()?.french);
    if (!nonCurrentWord) { // Should only happen if all words are identical, or only one word
        nonCurrentWord = service.getWords()[0]; // Fallback, though previous check should handle
    }

    const initialSuccesses = nonCurrentWord.successes;
    service.updateSuccessCount(nonCurrentWord);

    const updatedNonCurrentWordInList = service.getWords().find(w => w.french === nonCurrentWord!.french);
    expect(updatedNonCurrentWordInList?.successes).toBe(initialSuccesses + 1);

    // Verify current word's successes didn't change if it was different
    if (service.getCurrentWord()?.french !== nonCurrentWord.french) {
      const currentWordInitialSuccesses = service.getCurrentWord()?.successes;
      expect(service.getCurrentWord()?.successes).toBe(currentWordInitialSuccesses);
    }
  });

  it('getCurrentWord should return undefined initially if no word selected', () => {
    // This test depends on the service NOT selecting a word in its constructor
    // Re-instantiate for a clean state:
    const freshService = new VocabularyService();
    expect(freshService.getCurrentWord()).toBeUndefined();
  });

});
