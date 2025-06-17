import { ActionDTO } from './table-actions/table-actions.component';

export type AgridataTableCell = {
  header: string;
  value: string;
};

export type AgridataTableData = {
  data: AgridataTableCell[];
  highlighted?: boolean;
  actions: ActionDTO[];
  rowAction?: () => void;
  id: string;
};

export enum SortDirections {
  ASC = 'asc',
  DESC = 'desc',
}
