import { TestBed } from '@angular/core/testing';

import { ImageProcessingService } from './image-processing.service';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('keeps jpeg output as jpeg', () => {
    expect(service.resolveOutputMimeType('image/jpeg')).toBe('image/jpeg');
  });

  it('keeps png output as png', () => {
    expect(service.resolveOutputMimeType('image/png')).toBe('image/png');
  });

  it('prefers the smallest jpeg variant', async () => {
    const file = new File(['jpeg-data'], 'photo.jpeg', { type: 'image/jpeg' });
    spyOn(service, 'readFileAsDataUrl').and.resolveTo('data:image/jpeg;base64,ABCDEFGHIJK');
    spyOn<any>(service, 'compressImage').and.resolveTo('data:image/jpeg;base64,ABC');

    const result = await service.readProcessedImage(file);

    expect(result).toBe('data:image/jpeg;base64,ABC');
  });

  it('prefers the smallest png variant, including png optimization', async () => {
    const file = new File(['png-data'], 'photo.png', { type: 'image/png' });
    spyOn(service, 'readFileAsDataUrl').and.resolveTo('data:image/png;base64,ABCDEFGHIJK');
    spyOn<any>(service, 'compressImage').and.resolveTo('data:image/png;base64,ABCDEFG');
    spyOn<any>(service, 'compressPngImage').and.resolveTo('data:image/png;base64,ABC');

    const result = await service.readProcessedImage(file);

    expect(result).toBe('data:image/png;base64,ABC');
  });
});
