import { TestBed } from '@angular/core/testing';
import { FileEncryptionService } from './file-encryption.service';
import { EncryptionService } from './encryption.service';

describe('FileEncryptionService', () => {
  let service: FileEncryptionService;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('EncryptionService', ['encrypt', 'decrypt']);

    TestBed.configureTestingModule({
      providers: [FileEncryptionService, { provide: EncryptionService, useValue: spy }],
    });

    service = TestBed.inject(FileEncryptionService);
    encryptionServiceSpy = TestBed.inject(EncryptionService) as jasmine.SpyObj<EncryptionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should encrypt a file', async () => {
    // Arrange
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockIv = new Uint8Array(12);
    const mockEncryptedData = new ArrayBuffer(8);

    // Mock the crypto.getRandomValues function
    spyOn(crypto, 'getRandomValues').and.returnValue(mockIv);

    // Mock the encryptionService.encrypt method
    encryptionServiceSpy.encrypt.and.returnValue(Promise.resolve(mockEncryptedData));

    // Act
    const result = await service.encryptFile(mockFile);

    // Assert
    expect(result.encryptedData).toBe(mockEncryptedData);
    expect(result.iv).toBe(mockIv);
    expect(encryptionServiceSpy.encrypt).toHaveBeenCalledWith(jasmine.any(ArrayBuffer), mockIv);
  });

  it('should decrypt a file', async () => {
    // Arrange
    const mockEncryptedData = new ArrayBuffer(8);
    const mockIv = new Uint8Array(12);
    const mockDecryptedData = new ArrayBuffer(8);

    // Mock the encryptionService.decrypt method
    encryptionServiceSpy.decrypt.and.returnValue(Promise.resolve(mockDecryptedData));

    // Act
    const result = await service.decryptFile(mockEncryptedData, mockIv);

    // Assert
    expect(result).toBe(mockDecryptedData);
    expect(encryptionServiceSpy.decrypt).toHaveBeenCalledWith(mockEncryptedData, mockIv);
  });
});
