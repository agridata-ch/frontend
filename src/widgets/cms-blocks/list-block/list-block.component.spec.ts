import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBlockComponent } from './list-block.component';

describe('ListBlockComponent', () => {
  let component: ListBlockComponent;
  let fixture: ComponentFixture<ListBlockComponent>;
  let componentRef: ComponentRef<ListBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListBlockComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;

    componentRef.setInput('list', {
      id: 33,
      heading: 'Ihre digitale Souveränität:',
      items: [
        {
          id: 114,
          label: 'Sie entscheiden, wer Zugriff auf Ihre Daten erhält',
          icon: {
            id: 17,
            documentId: 'ggg7xbwh91edowi71d44s6fm',
            alternativeText: null,
            url: '/uploads/icon_97b99a9124.png',
            formats: null,
          },
        },
        {
          id: 115,
          label: 'Transparente Übersicht auf Ihrem persönlichen Dashboard',
          icon: {
            id: 17,
            documentId: 'ggg7xbwh91edowi71d44s6fm',
            alternativeText: null,
            url: '/uploads/icon_97b99a9124.png',
            formats: null,
          },
        },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
