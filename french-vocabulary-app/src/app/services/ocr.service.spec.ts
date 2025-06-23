import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OcrService, OcrSpaceResponse } from './ocr.service';

describe('OcrService', () => {
  let service: OcrService;
  let httpMock: HttpTestingController;
  const testApiKey = 'TEST_API_KEY'; // Use a test key for specs

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OcrService]
    });
    service = TestBed.inject(OcrService);
    httpMock = TestBed.inject(HttpTestingController);
    // Override the API key for testing to avoid console warnings/errors
    (service as any).apiKey = testApiKey;
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call OCR.space API and return parsed text', (done) => {
    const mockBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const mockResponse: OcrSpaceResponse = {
      ParsedResults: [{ ParsedText: 'Bonjour', ErrorMessage: '', ErrorDetails: '' }],
      OCRExitCode: 1,
      IsErroredOnProcessing: false,
      ProcessingTimeInMilliseconds: '100',
      SearchablePDFURL: ''
    };

    service.recognizeImage(mockBase64Image).subscribe(text => {
      expect(text).toEqual('Bonjour');
      done();
    });

    const req = httpMock.expectOne('https://api.ocr.space/parse/image');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('apikey')).toBe(testApiKey);

    const formData = req.request.body as FormData;
    expect(formData.get('base64Image')).toBe(mockBase64Image);
    expect(formData.get('language')).toBe('fre');
    expect(formData.get('OCREngine')).toBe('2');

    req.flush(mockResponse);
  });

  it('should return null if OCR processing fails', (done) => {
    const mockBase64Image = 'data:image/png;base64,mockImageData';
    const mockErrorResponse: OcrSpaceResponse = {
      ParsedResults: [{ ParsedText: '', ErrorMessage: 'Some OCR error', ErrorDetails: 'Details' }],
      OCRExitCode: 3,
      IsErroredOnProcessing: true,
      ProcessingTimeInMilliseconds: '50',
      SearchablePDFURL: ''
    };

    service.recognizeImage(mockBase64Image).subscribe(text => {
      expect(text).toBeNull();
      done();
    });

    const req = httpMock.expectOne('https://api.ocr.space/parse/image');
    req.flush(mockErrorResponse);
  });

  it('should handle HTTP errors', (done) => {
    const mockBase64Image = 'data:image/png;base64,mockImageData';

    service.recognizeImage(mockBase64Image).subscribe({
      next: () => fail('should have failed with an HTTP error'),
      error: (err) => {
        expect(err.message).toContain('Failed to call OCR API.');
        done();
      }
    });

    const req = httpMock.expectOne('https://api.ocr.space/parse/image');
    req.flush('Simulated HTTP error', { status: 500, statusText: 'Server Error' });
  });

  it('should throw an error if API key is not set (actual placeholder)', (done) => {
    // Temporarily set the key to the placeholder to test the guard
    (service as any).apiKey = 'K8 opérationsOCR YOUR_API_KEY';

    service.recognizeImage('someimage').subscribe({
      next: () => fail('should have thrown error for missing API key'),
      error: (err) => {
        expect(err.message).toContain('API key not set.');
        done();
      }
    });
    // No HTTP request should be made in this case
    httpMock.expectNone('https://api.ocr.space/parse/image');
  });

});
