import { Injectable } from '@angular/core';

export interface Word {
  french: string;
  dutch: string;
  successes: number;
}

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {

  private words: Word[] = [
    { french: 'bonjour', dutch: 'hallo', successes: 0 },
    { french: 'merci', dutch: 'dank je', successes: 0 },
    { french: 'au revoir', dutch: 'tot ziens', successes: 0 },
    // Add more words here
  ];

  constructor() { }

  getWords(): Word[] {
    return this.words;
  }

  getRandomWord(): Word {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    this.currentWord = this.words[randomIndex];
    return this.currentWord;
  }

  updateSuccessCount(word: Word): void {
    const index = this.words.findIndex(w => w.french === word.french);
    if (index !== -1) {
      this.words[index].successes++;
      // If the updated word is the current word, update its reference too
      if (this.currentWord && this.currentWord.french === word.french) {
        this.currentWord.successes = this.words[index].successes;
      }
    }
  }

  getCurrentWord(): Word | undefined {
    return this.currentWord;
  }

  selectNewRandomWord(): Word {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    this.currentWord = this.words[randomIndex];
    return this.currentWord;
  }

  // Add a property to hold the current word
  private currentWord: Word | undefined;
}
