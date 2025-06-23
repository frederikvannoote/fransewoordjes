import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface OcrSpaceResponse {
  ParsedResults: {
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
  }[];
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds: string;
  SearchablePDFURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private apiKey = 'YOUR_API_KEY'; // Replaced with your actual API key
  private apiUrl = 'https://api.ocr.space/parse/image';

  constructor(private http: HttpClient) { }

  recognizeImage(base64Image: string): Observable<string | null> {
    if (this.apiKey === 'YOUR_API_KEY' && this.apiKey.includes('YOUR_API_KEY')) { // Modified condition to check if it's still the placeholder
      console.warn('OCR.space API key might still be a placeholder. Please ensure it is replaced with a valid key.');
      // Depending on requirements, you might want to prevent API calls if the key is clearly a placeholder.
      // For now, we'll proceed but log a warning.
    }

    const headers = new HttpHeaders({
      'apikey': this.apiKey
    });

    const formData = new FormData();
    formData.append('base64Image', base64Image);
    formData.append('language', 'fre'); // French language
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is generally better for handwriting

    return this.http.post<OcrSpaceResponse>(this.apiUrl, formData, { headers }).pipe(
      map(response => {
        if (response.IsErroredOnProcessing) {
          console.error('OCR Error:', response.ParsedResults[0]?.ErrorMessage || 'Unknown OCR error');
          return null;
        }
        if (response.ParsedResults && response.ParsedResults.length > 0) {
          return response.ParsedResults[0].ParsedText.trim();
        }
        return null;
      }),
      catchError(error => {
        console.error('HTTP Error calling OCR.space:', error);
        return throwError(() => new Error('Failed to call OCR API.'));
      })
    );
  }
}
