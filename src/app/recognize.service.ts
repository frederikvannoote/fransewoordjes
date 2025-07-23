import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Makes the service available throughout the application
})
export class RecognizeService {
  private endpoint: string = '';
  private apiKey: string = '';

  constructor(private http: HttpClient) {}

  /**
   * Sets the endpoint for Azure Computer Vision API.
   * @param endpoint The endpoint URL to set.
   */
  // Note: The endpoint should be set to the specific Azure Computer Vision endpoint.
  setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Sets the API key for Azure Computer Vision.
   * @param apiKey The API key to set.
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Recognizes text in an image using Azure Computer Vision API.
   * @param imageData The image data as a Blob.
   * @returns A promise that resolves with the recognition result.
   */
  recognizeImage(imageData: Blob): Promise<any> {
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.apiKey,
      'Content-Type': 'application/octet-stream'
    });

    return this.http.post(this.endpoint + '/computervision/imageanalysis:analyze?features=read&model-version=latest&language=en&gender-neutral-caption=false&api-version=2023-10-01',
       imageData, { headers }).toPromise();
  }
}