import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTimelineComponent } from './section-timeline.component';

describe('SectionTimelineComponent', () => {
  let component: SectionTimelineComponent;
  let fixture: ComponentFixture<SectionTimelineComponent>;
  let componentRef: ComponentRef<SectionTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTimelineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionTimelineComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'layout.section-timeline',
      id: 1,
      heading: 'So einfach funktioniert der Datenaustausch',
      subHeading: 'In wenigen Schritten zu den benötigten Landwirtschaftsdaten.',
      anchorId: 'timeline',
      cards: [
        {
          id: 1,
          heading: 'Antrag',
          description:
            'Eine Organisation möchte Ihre Daten nutzen und erstellt dazu ein Datenantrag auf agridata.ch',
          image: {
            id: 44,
            documentId: 'xq9ewkoqjh281prvo5vyne6b',
            alternativeText: null,
            url: '/uploads/L_Datenaustausch3_433fb847f0.png',
          },
        },
        {
          id: 2,
          heading: 'Anfrage',
          description:
            'Sie bekommen eine Anfrage um Einwilligung Ihrer Daten. Sie entscheiden ob Sie Ihre Daten teilen oder nicht.',
          image: {
            id: 45,
            documentId: 'h7cqqovas7zv7qo48ggksroo',
            alternativeText: null,
            url: '/uploads/Landwirte_1_daecff80e9.png',
          },
        },
        {
          id: 3,
          heading: 'Austausch',
          description: 'Ihre Daten werden sicher von  Agis zur Organisation übertragen ',
          image: {
            id: 46,
            documentId: 'o2bn2skw0ull93c6nwjkf20z',
            alternativeText: null,
            url: '/uploads/e869f7db3149f4bab63a7716aa72abd64427ecdc_b30a708308.png',
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
