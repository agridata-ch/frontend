import { faPenToSquare, faRemove } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { Meta, StoryObj } from '@storybook/angular';

import {
  AgridataClientTableComponent,
  ClientTableMetadata,
} from '@/shared/ui/agridata-client-table';
import { CellRendererTypes, SortDirections } from '@/shared/ui/agridata-table';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const SAMPLE_DATA: Person[] = [
  { id: 1, name: 'Alice Müller', email: 'alice@example.com', role: 'Admin', active: true },
  { id: 2, name: 'Bob Schmidt', email: 'bob@example.com', role: 'Editor', active: false },
  { id: 3, name: 'Clara Weber', email: 'clara@example.com', role: 'Viewer', active: true },
  { id: 4, name: 'David Koch', email: 'david@example.com', role: 'Editor', active: true },
  { id: 5, name: 'Eva Fischer', email: 'eva@example.com', role: 'Viewer', active: false },
  { id: 6, name: 'Felix Wagner', email: 'felix@example.com', role: 'Admin', active: true },
  { id: 7, name: 'Greta Bauer', email: 'greta@example.com', role: 'Viewer', active: true },
  { id: 8, name: 'Hans Braun', email: 'hans@example.com', role: 'Editor', active: false },
  { id: 9, name: 'Ines Richter', email: 'ines@example.com', role: 'Admin', active: true },
  { id: 10, name: 'Jan Wolf', email: 'jan@example.com', role: 'Viewer', active: true },
  { id: 11, name: 'Karin Hahn', email: 'karin@example.com', role: 'Editor', active: false },
  { id: 12, name: 'Leo Schäfer', email: 'leo@example.com', role: 'Admin', active: true },
];

const BASE_METADATA: ClientTableMetadata<Person> = {
  idColumn: 'id',
  columns: [
    {
      name: 'Name',
      sortField: 'name',
      sortable: true,
      renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.name },
    },
    {
      name: 'Email',
      sortField: 'email',
      sortable: true,
      renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.email },
    },
    {
      name: 'Role',
      sortField: 'role',
      sortable: true,
      initialSortDirection: SortDirections.ASC,
      renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.role },
    },
  ],
  searchFn: (data, term) =>
    data.filter(
      (p) =>
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.email.toLowerCase().includes(term.toLowerCase()),
    ),
};

const meta: Meta<AgridataClientTableComponent<Person>> = {
  title: 'Shared/UI/Table',
  component: AgridataClientTableComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AgridataClientTableComponent<Person>>;

export const Default: Story = {
  render: () => ({
    props: { data: SAMPLE_DATA, metadata: BASE_METADATA },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
      />
    `,
  }),
};

export const WithSearch: Story = {
  render: () => ({
    props: { data: SAMPLE_DATA, metadata: BASE_METADATA },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
        [enableSearch]="true"
      />
    `,
  }),
};

export const WithRowAction: Story = {
  render: () => ({
    props: {
      data: SAMPLE_DATA,
      metadata: {
        ...BASE_METADATA,
        showRowActionButton: true,
        rowAction: (row: Person) => alert(`Clicked: ${row.name}`),
      } as ClientTableMetadata<Person>,
    },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
      />
    `,
  }),
};

export const WithRowMenu: Story = {
  render: () => ({
    props: {
      data: SAMPLE_DATA,
      metadata: {
        ...BASE_METADATA,
        rowMenuActions: (row: Person) => [
          { label: 'Edit', icon: faPenToSquare, callback: async () => alert(`Edit: ${row?.name}`) },
          { label: 'Delete', icon: faRemove, callback: async () => alert(`Delete: ${row?.name}`) },
        ],
      } as ClientTableMetadata<Person>,
    },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
      />
    `,
  }),
};

export const WithHighlight: Story = {
  render: () => ({
    props: {
      data: SAMPLE_DATA,
      metadata: {
        ...BASE_METADATA,
        highlightFn: (row: Person) => !row.active,
      } as ClientTableMetadata<Person>,
    },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
      />
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { data: [], metadata: BASE_METADATA },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
      />
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    props: { data: SAMPLE_DATA, metadata: BASE_METADATA },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
        [loading]="true"
      />
    `,
  }),
};

export const SmallPageSize: Story = {
  render: () => ({
    props: { data: SAMPLE_DATA, metadata: BASE_METADATA },
    template: `
      <app-agridata-client-table
        [rawData]="data"
        [tableMetadata]="metadata"
        [pageSize]="3"
      />
    `,
  }),
};
