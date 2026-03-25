import { TestBed } from '@angular/core/testing';
import { ImageProcessingService } from './image-processing.service';
import { TaskAttachmentProcessingService } from './task-attachment-processing.service';

describe('TaskAttachmentProcessingService', () => {
  let service: TaskAttachmentProcessingService;
  let imageProcessingService: jasmine.SpyObj<ImageProcessingService>;

  beforeEach(() => {
    imageProcessingService = jasmine.createSpyObj<ImageProcessingService>('ImageProcessingService', [
      'readProcessedImage',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TaskAttachmentProcessingService,
        { provide: ImageProcessingService, useValue: imageProcessingService },
      ],
    });

    service = TestBed.inject(TaskAttachmentProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('preserves the uploaded jpeg mime type and original file name', async () => {
    const file = new File(['jpeg-data'], 'holiday-photo.jpeg', { type: 'image/jpeg' });
    imageProcessingService.readProcessedImage.and.resolveTo('data:image/jpeg;base64,QUJD');

    const result = await service.resolveAttachmentsForSave([], [file]);

    expect(result.warningMessage).toBe('');
    expect(result.attachments).toHaveSize(1);
    expect(result.attachments[0].fileType).toBe('image/jpeg');
    expect(result.attachments[0].fileName).toBe('holiday-photo.jpeg');
  });

  it('skips unsupported mime types', async () => {
    const file = new File(['gif-data'], 'animated.gif', { type: 'image/gif' });

    const result = await service.resolveAttachmentsForSave([], [file]);

    expect(imageProcessingService.readProcessedImage).not.toHaveBeenCalled();
    expect(result.attachments).toEqual([]);
    expect(result.warningMessage).toContain('1 attachment was skipped');
  });
});
