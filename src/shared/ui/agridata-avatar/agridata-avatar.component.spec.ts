import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataAvatarComponent } from './agridata-avatar.component';

describe('AgridataAvatarComponent', () => {
  let component: AgridataAvatarComponent;
  let fixture: ComponentFixture<AgridataAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
