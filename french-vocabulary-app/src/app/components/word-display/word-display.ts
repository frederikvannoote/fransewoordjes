import { Component, OnInit } from '@angular/core';
import { VocabularyService, Word } from '../../services/vocabulary.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-word-display',
  imports: [CommonModule],
  templateUrl: './word-display.html',
  styleUrl: './word-display.css'
})
export class WordDisplay implements OnInit {
  currentWord: Word | undefined;

  constructor(public vocabularyService: VocabularyService) { } // Made public for easier access if needed, or use getter

  ngOnInit(): void {
    // Ensure a word is selected when the component initializes
    if (!this.vocabularyService.getCurrentWord()) {
      this.vocabularyService.selectNewRandomWord();
    }
    // currentWord property will now be a getter to the service's current word
  }

  get currentWord(): Word | undefined {
    return this.vocabularyService.getCurrentWord();
  }

  // showNewWord method removed as it's now handled by AppComponent
}
