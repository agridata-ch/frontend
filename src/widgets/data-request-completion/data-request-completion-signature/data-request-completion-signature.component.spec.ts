import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionSignatureDto, SignatureSlotCodeEnum } from '@/entities/openapi';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestCompletionSignatureComponent } from './data-request-completion-signature.component';

const mockSignature: ContractRevisionSignatureDto = {
  name: 'Test Consumer',
  signatureSlotCode: SignatureSlotCodeEnum.DataConsumer01,
  timestamp: '2026-03-20T10:00:00Z',
  userId: 'user-123',
};

describe('DataRequestCompletionSignatureComponent', () => {
  let component: DataRequestCompletionSignatureComponent;
  let componentRef: ComponentRef<DataRequestCompletionSignatureComponent>;
  let fixture: ComponentFixture<DataRequestCompletionSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestCompletionSignatureComponent, createTranslocoTestingModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestCompletionSignatureComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('signature', mockSignature);
    componentRef.setInput('position', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
