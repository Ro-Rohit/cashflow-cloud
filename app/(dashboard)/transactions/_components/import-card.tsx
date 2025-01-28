import { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImportTable from './import-table';
import { useState } from 'react';
import { convertAmountToMiliUnit, parseDateWithFormats } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Props {
  onCancel: () => void;
  data: string[][];
  onSubmit: (data: any) => void;
}

const requiredOption = ['amount', 'date', 'payee'];

interface SelectColumnState {
  [key: string]: string | null;
}

const possibleDateFormats = [
  'dd-MM-yyyy',
  'yyyy-MM-dd HH:mm:ss',
  'MM-dd-yyyy',
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'yyyy/MM/dd',
  'MMM dd, yyyy',
  'MMMM dd, yyyy',
];

const outputFormat = 'yyyy-MM-dd';

const ImportCard: NextPage<Props> = ({ onCancel, data, onSubmit }) => {
  const headerData = data[0];
  const bodyData = data.slice(1);
  const [selectedColumns, setSelectedColumns] = useState<SelectColumnState>({});

  const onTableHeadSelectChange = (columnIdx: number, value: string | null) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };
      for (const key in newSelectedColumns) {
        //reset column if any other column with this name is selected
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }
      if (value === 'Skip') {
        value === null;
      }
      newSelectedColumns[`column_${columnIdx}`] = value;
      return newSelectedColumns;
    });
  };

  const handleContinue = () => {
    // Map headers based on selectedColumns
    const mappedData = {
      headers: headerData.map((_header, idx) => {
        const columnKey = `column_${idx}`;
        return selectedColumns[columnKey] || null; // Match header with selected column
      }),

      body: bodyData
        .map((row) => {
          // Transform each row based on selectedColumns
          const transformedRow = row.map((cell, idx) => {
            const columnKey = `column_${idx}`;
            return selectedColumns[columnKey] && cell !== '' ? cell : null;
          });

          // Remove rows where all cells are null
          return transformedRow.every((cell) => cell === null) ? null : transformedRow;
        })
        .filter((row) => row !== null), // Remove null rows
    };

    // Map rows into objects
    const arrayOfData = mappedData.body.map((row) => {
      return row?.reduce((acc: any, cell, idx) => {
        const header = mappedData.headers[idx];
        if (header !== null) {
          acc[header] = cell;
        }
        return acc;
      }, {});
    });

    // Format the data
    const formattedData = arrayOfData
      .map((row: any) => {
        try {
          const parsedDate = parseDateWithFormats(row.date, possibleDateFormats);
          if (!parsedDate) throw new Error(`Invalid date format: ${row.date}`);

          return {
            ...row,
            amount: convertAmountToMiliUnit(row.amount),
            date: format(parsedDate, outputFormat),
          };
        } catch (err) {
          toast.error('Invalid date Format');
          return null; // Skip invalid rows
        }
      })
      .filter((row) => row !== null); // Remove null rows

    onSubmit(formattedData);
  };

  const handleCheckAndContinue = () => {
    const selectedOptions: any[] = [];
    for (const key in selectedColumns) {
      if (selectedColumns[key] !== null) {
        selectedOptions.push(selectedColumns[key]);
      }
    }
    const isValid = requiredOption.every((option) => selectedOptions.includes(option));
    if (isValid) {
      handleContinue();
    } else {
      toast.error('Please select all required options');
    }
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <Card className="border border-primary max-w-screen-xl pb-10 mx-5 lg:mx-auto shadow-md p-4 mb-10 mt-[120px]  sm:mt-[-140px]">
      <CardHeader className="flex flex-col sm:flex-row gap-y-1 items-center justify-between">
        <CardTitle className="text-2xl text-current sm:text-left font-semibold">
          Import Page
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-1  w-full sm:w-auto">
          <Button onClick={onCancel} className="w-full sm:w-auto">
            <span className="ml-0.5 text-white">Cancel</span>
          </Button>
          <Button
            disabled={progress < 3}
            onClick={handleCheckAndContinue}
            className="w-full sm:w-auto"
          >
            <span className="ml-0.5 text-white">
              Continue ({progress}/{5})
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ImportTable
          selectedColumns={selectedColumns}
          onTableHeadSelectChange={onTableHeadSelectChange}
          headerData={headerData}
          bodyData={bodyData}
        />
      </CardContent>
    </Card>
  );
};

export default ImportCard;
