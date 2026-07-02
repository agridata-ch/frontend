import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataDropzoneComponent } from './agridata-dropzone.component';

describe('AgridataDropzoneComponent', () => {
  let component: AgridataDropzoneComponent;
  let fixture: ComponentFixture<AgridataDropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataDropzoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createFile(name: string): File {
    return new File(['content'], name, { type: 'application/pdf' });
  }

  // jsdom lacks DataTransfer/FileList, so build an array-like that Array.from() accepts.
  function createFileList(files: File[]): FileList {
    const list: Record<number, File> & { length: number } = { length: files.length };
    files.forEach((file, index) => (list[index] = file));
    return list as unknown as FileList;
  }

  function createDropEvent(files: File[]): Event {
    const event = new Event('drop');
    Object.defineProperty(event, 'dataTransfer', { value: { files: createFileList(files) } });
    return event;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits selected files from the file input', () => {
    const emitted: File[][] = [];
    component.filesSelected.subscribe((files) => emitted.push(files));

    const inputEl = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    Object.defineProperty(inputEl, 'files', {
      value: createFileList([createFile('a.pdf')]),
      configurable: true,
    });
    inputEl.dispatchEvent(new Event('change'));

    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].name).toBe('a.pdf');
  });

  it('emits dropped files and clears drag-over state', () => {
    const emitted: File[][] = [];
    component.filesSelected.subscribe((files) => emitted.push(files));

    fixture.nativeElement
      .querySelector('button')
      .dispatchEvent(createDropEvent([createFile('b.pdf')]));

    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].name).toBe('b.pdf');
  });

  it('does not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const emitted: File[][] = [];
    component.filesSelected.subscribe((files) => emitted.push(files));

    fixture.nativeElement
      .querySelector('button')
      .dispatchEvent(createDropEvent([createFile('c.pdf')]));

    expect(emitted).toHaveLength(0);
  });
});
