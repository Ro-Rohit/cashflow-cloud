import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NextPage } from 'next';
import TableHeadSelect from './column-select';

interface Props {
  headerData: string[];
  bodyData: string[][];
  selectedColumns: Record<string, string | null>;
  onTableHeadSelectChange: (columnIdx: number, value: string | null) => void;
}

const ImportTable: NextPage<Props> = ({
  headerData,
  bodyData,
  selectedColumns,
  onTableHeadSelectChange,
}) => {
  return (
    <Table>
      <TableHeader className="bg-muted">
        <TableRow>
          {headerData.map((head, idx) => (
            <TableHead key={idx}>
              <TableHeadSelect
                columnIndex={idx}
                selectedColumn={selectedColumns}
                onChange={onTableHeadSelectChange}
              />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bodyData.map((row, idx) => (
          <TableRow key={idx}>
            {row.map((cell, index) => (
              <TableCell key={index}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ImportTable;
