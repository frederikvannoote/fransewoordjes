import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Makes the service available throughout the application
})
export class RecognizeService {
  private readonly endpoint = 'https://franse-vocabulary.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=read&model-version=latest&language=en&gender-neutral-caption=false&api-version=2023-10-01'

  constructor(private http: HttpClient) {}

  recognizeImage(imageData: Blob, apiKey: string): Promise<any> {
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/octet-stream'
    });

    return this.http.post(this.endpoint, imageData, { headers }).toPromise();
  }
}