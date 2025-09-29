import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';

import { AgridataContactCardComponent } from './agridata-contact-card.component';

describe('AgridataContactCardComponent', () => {
  let component: AgridataContactCardComponent;
  let fixture: ComponentFixture<AgridataContactCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataContactCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataContactCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display name when provided', () => {
    const testName = 'Max Mustermann';
    fixture.componentRef.setInput('name', testName);
    fixture.detectChanges();

    const nameElement = fixture.debugElement.query(By.css('.agridata-ellipsis'));
    expect(nameElement.nativeElement.textContent.trim()).toBe(testName);
    expect(nameElement.nativeElement.title).toBe(testName);
  });

  it('should display secondary name when provided', () => {
    const testSecondaryName = 'Secondary Name';
    fixture.componentRef.setInput('secondaryName', testSecondaryName);
    fixture.detectChanges();

    const secondaryNameElement = fixture.debugElement.query(By.css('.text-gray-500'));
    expect(secondaryNameElement.nativeElement.textContent.trim()).toBe(testSecondaryName);
    expect(secondaryNameElement.nativeElement.title).toBe(testSecondaryName);
  });

  it('should pass correct props to avatar component', () => {
    const testImageUrl = 'test-image.jpg';
    const testName = 'Test Name';
    const testSize = AvatarSize.SMALL;
    const testSkin = AvatarSkin.DEFAULT;

    fixture.componentRef.setInput('imageUrl', testImageUrl);
    fixture.componentRef.setInput('name', testName);
    fixture.componentRef.setInput('size', testSize);
    fixture.componentRef.setInput('skin', testSkin);
    fixture.detectChanges();

    const avatarComponent = fixture.debugElement.query(By.directive(AgridataAvatarComponent));
    expect(avatarComponent.componentInstance.imageUrl()).toBe(testImageUrl);
    expect(avatarComponent.componentInstance.name()).toBe(testName);
    expect(avatarComponent.componentInstance.size()).toBe(testSize);
    expect(avatarComponent.componentInstance.skin()).toBe(testSkin);
  });

  it('should not display name element when name is not provided', () => {
    fixture.componentRef.setInput('name', undefined);
    fixture.detectChanges();

    const nameElement = fixture.debugElement.query(
      By.css('.agridata-ellipsis:not(.text-gray-500)'),
    );
    expect(nameElement).toBeNull();
  });

  it('should not display secondary name element when secondary name is not provided', () => {
    fixture.componentRef.setInput('secondaryName', undefined);
    fixture.detectChanges();

    const secondaryNameElement = fixture.debugElement.query(By.css('.text-gray-500'));
    expect(secondaryNameElement).toBeNull();
  });
});
