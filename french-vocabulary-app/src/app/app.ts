import { Component } from '@angular/core';
import { WordDisplay } from './components/word-display/word-display';
import { CanvasInput } from './components/canvas-input/canvas-input';
import { CommonModule } from '@angular/common';
import { OcrService } from './services/ocr.service';
import { VocabularyService, Word } from './services/vocabulary.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, WordDisplay, CanvasInput],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'French Vocabulary App';
  ocrResult: string | null = null;
  feedbackMessage: string | null = null;
  isLoadingOcr = false;

  constructor(
    private ocrService: OcrService,
    private vocabularyService: VocabularyService // Inject VocabularyService
  ) {}

  handleDrawingSubmission(imageDataUrl: string): void {
    this.isLoadingOcr = true;
    this.feedbackMessage = null;
    this.ocrResult = null;

    const currentWord = this.vocabularyService.getCurrentWord();

    if (!currentWord) {
      this.feedbackMessage = "Error: No word is currently selected to check against.";
      this.isLoadingOcr = false;
      return;
    }

    // Ensure API key is not the placeholder before making a call
    // The OcrService itself also has a check, but an early exit here can be good UX.
    if (this.ocrService['apiKey'].includes('YOUR_API_KEY') && this.ocrService['apiKey'] === 'YOUR_API_KEY') {
        this.feedbackMessage = 'OCR functionality is disabled. Please configure a valid API key.';
        this.isLoadingOcr = false;
        this.ocrResult = 'N/A (API Key Missing)';
        return;
    }

    this.ocrService.recognizeImage(imageDataUrl).subscribe({
      next: (text) => {
        this.ocrResult = text;
        this.isLoadingOcr = false;
        this.validateAndFeedback(text, currentWord);
      },
      error: (error) => {
        console.error('OCR Error in component:', error);
        this.feedbackMessage = `Failed to get OCR result: ${error.message || 'Unknown error'}. Check console.`;
        this.isLoadingOcr = false;
      }
    });
  }

  private validateAndFeedback(ocrText: string | null, currentWord: Word): void {
    if (ocrText === null) {
      this.feedbackMessage = 'OCR could not recognize any text or an error occurred during processing.';
      return;
    }

    // Normalize both strings for comparison: lowercase and trim whitespace.
    // Consider removing accents/diacritics if OCR is inconsistent with them.
    const normalizedOcrText = ocrText.toLowerCase().trim();
    const normalizedFrenchWord = currentWord.french.toLowerCase().trim();

    if (normalizedOcrText === normalizedFrenchWord) {
      this.feedbackMessage = 'Correct! Well done!';
      this.vocabularyService.updateSuccessCount(currentWord);
      // Optionally, automatically show the next word after a short delay
      // setTimeout(() => this.vocabularyService.selectNewRandomWord(), 2000);
    } else {
      this.feedbackMessage = `Not quite. You wrote "${ocrText}", the answer is "${currentWord.french}". Try again or click "Next Word".`;
    }
  }

  // Expose method to allow template to get next word via VocabularyService
  showNewWord(): void {
    this.vocabularyService.selectNewRandomWord();
    this.feedbackMessage = null; // Clear feedback when a new word is shown
    this.ocrResult = null;
  }
}
