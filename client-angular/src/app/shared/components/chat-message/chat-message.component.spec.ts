import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ChatMessageComponent } from './chat-message.component';
import { EncryptionService } from '../../../core/services/encryption.service';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { LinkifyPipe } from '../../pipes/linkify.pipe';
import { DomSanitizer } from '@angular/platform-browser';
';
// import { By } from '@angular/platform-browser'; // Commented out as it's currently unused

';
describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture;
  let encryptionServiceSpy: jasmine.SpyObj;
  // These spies are created but not used in current tests
  // Will be used in future test implementations
  // let authServiceSpy: jasmine.SpyObj;
  // let changeDetectorRefSpy: jasmine.SpyObj;

  beforeEach(async () => {
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', ['decryptMessage'])
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId'])
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck'])

    authSpy.getCurrentUserId.and.returnValue('current-user-id')

    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent, TimeAgoPipe],
      providers: [;
        { provide: EncryptionService, useValue: encryptionSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy },
        {
          provide: LinkifyPipe,
          useFactory: () => new LinkifyPipe(TestBed.inject(DomSanitizer)),
        },
      ],
    }).compileComponents()

    encryptionServiceSpy = TestBed.inject(EncryptionService) as jasmine.SpyObj;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj;
    changeDetectorRefSpy = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj;

    fixture = TestBed.createComponent(ChatMessageComponent)
    component = fixture.componentInstance;

    // Set up default message
    component.message = {
      _id: 'msg-1',
      roomId: 'room-1',
      sender: { id: 'sender-1', username: 'TestUser' },
      message: 'Hello, world!',
      timestamp: new Date(),
      read: false,
    }

    component.roomId = 'room-1';
  })

  it('should create', () => {
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should display unencrypted message content directly', () => {
    component.message.isEncrypted = false;
    fixture.detectChanges()

    expect(component.decryptedContent).toBe('Hello, world!')
  })

  it('should identify current user messages correctly', () => {
    // Message from current user
    component.message.sender = { id: 'current-user-id', username: 'CurrentUser' }
    fixture.detectChanges()

    expect(component.isCurrentUser).toBeTrue()

    // Message from another user
    component.message.sender = { id: 'other-user-id', username: 'OtherUser' }
    fixture.detectChanges()

    expect(component.isCurrentUser).toBeFalse()
  })

  it('should handle string sender ID', () => {
    component.message.sender = 'sender-id';
    fixture.detectChanges()

    expect(component.getSenderName()).toBe('Unknown User')
  })

  it('should decrypt encrypted messages', async () => {
    // Setup encrypted message
    component.message.isEncrypted = true;
    component.message.message = 'encrypted-content';
    component.message.encryptionData = {
      iv: 'test-iv',
      authTag: 'test-auth-tag',
    }

    // Mock successful decryption
    encryptionServiceSpy.decryptMessage.and.resolveTo('Decrypted message')

    // Initialize component
    fixture.detectChanges()

    // Wait for async decryption
    await fixture.whenStable()
    fixture.detectChanges()

    expect(encryptionServiceSpy.decryptMessage).toHaveBeenCalledWith('room-1', {
      ciphertext: 'encrypted-content',
      iv: 'test-iv',
      authTag: 'test-auth-tag',
    })

    expect(component.decryptedContent).toBe('Decrypted message')
    expect(component.decryptionFailed).toBeFalse()
  })

  it('should handle decryption failure', async () => {
    // Setup encrypted message
    component.message.isEncrypted = true;
    component.message.message = 'encrypted-content';
    component.message.encryptionData = {
      iv: 'test-iv',
      authTag: 'test-auth-tag',
    }

    // Mock failed decryption
    encryptionServiceSpy.decryptMessage.and.resolveTo(null)

    // Initialize component
    fixture.detectChanges()

    // Wait for async decryption
    await fixture.whenStable()
    fixture.detectChanges()

    expect(component.decryptionFailed).toBeTrue()
    expect(component.decryptedContent).toContain('Unable to decrypt')
  })

  it('should handle missing encryption data', async () => {
    // Setup encrypted message without encryption data
    component.message.isEncrypted = true;
    component.message.message = 'encrypted-content';
    component.message.encryptionData = undefined;

    // Initialize component
    fixture.detectChanges()

    // Wait for async decryption
    await fixture.whenStable()
    fixture.detectChanges()

    expect(component.decryptionFailed).toBeTrue()
    expect(component.decryptedContent).toContain('Unable to decrypt')
    expect(encryptionServiceSpy.decryptMessage).not.toHaveBeenCalled()
  })

  it('should apply correct CSS classes based on message properties', () => {
    // Outgoing message
    component.isCurrentUser = true;
    fixture.detectChanges()

    let classes = component.getMessageClasses()
    expect(classes['message--outgoing']).toBeTrue()
    expect(classes['message--incoming']).toBeFalse()

    // Incoming encrypted message
    component.isCurrentUser = false;
    component.message.isEncrypted = true;
    fixture.detectChanges()

    classes = component.getMessageClasses()
    expect(classes['message--incoming']).toBeTrue()
    expect(classes['message--encrypted']).toBeTrue()

    // System message
    component.message.type = 'system';
    fixture.detectChanges()

    classes = component.getMessageClasses()
    expect(classes['message--system']).toBeTrue()
  })
})
