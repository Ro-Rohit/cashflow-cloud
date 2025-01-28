'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Download } from 'lucide-react';
import { downLoadJSON } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSubscriptionStore } from '@/features/subscription/hooks/use-subscription-store';
import { toast } from 'sonner';
import { useFinancialReportStore } from '@/features/summary/hooks/use-financial-report-store';
import { format } from 'date-fns';
import { ReportDescriptions, getTrendDescription } from '@/lib/const';

enum DOWNLOAD_TYPE {
  'PDF',
  'JSON',
}

const SummaryDownload = () => {
  const { financialReport: financialData } = useFinancialReportStore();
  const { plan, setOpen } = useSubscriptionStore();

  const checkToAddPage = (currentY: number, doc: jsPDF, distance: number = 50) => {
    if (currentY > doc.internal.pageSize.getHeight() - distance) {
      doc.addPage();
      return 50;
    }
    return currentY;
  };

  const getLastTablePosition = (doc: jsPDF) => {
    return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  };

  const createHeading = (doc: jsPDF, title: string, y: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, y, { align: 'center' });
  };

  const createDescription = (doc: jsPDF, text: string, y: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'normal');
    doc.text(text, pageWidth / 2, y, { maxWidth: pageWidth - 30, align: 'center' });
  };

  const generateFinancialReportPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4', unit: 'pt' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const xCenter = pageWidth / 2;
    const xLeft = 15;
    const xRight = pageWidth - 15;

    createHeading(doc, 'Financial Summary Report', 20);

    const { from, to } = financialData.period;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, xCenter, 40, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Period: from ${format(from, 'PPP')} to ${format(to, 'PPP')} `, xLeft, 65, {
      align: 'left',
    });

    createDescription(doc, ReportDescriptions.overview, 85);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 100, pageWidth - 10, 100);

    let currentY = 130;

    // Section 1: Summary Data
    if (financialData.summaryData) {
      const {
        incomeAmount,
        expensesAmount,
        remainingAmount,
        incomeChange,
        expensesChange,
        remainingChange,
      } = financialData.summaryData;

      createHeading(doc, 'Summary Data', currentY);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      currentY += 10;

      autoTable(doc, {
        head: [
          [
            'Total Income',
            'Total Expenses',
            'Remaining Amount',
            'Income Change',
            'Expenses Change',
            'Remaining Change',
          ],
        ],
        body: [
          [
            incomeAmount,
            expensesAmount,
            remainingAmount,
            `${incomeChange.toFixed(2)}%`,
            `${expensesChange.toFixed(2)}%`,
            `${remainingChange.toFixed(2)}%`,
          ],
        ],
        startY: currentY,
        theme: 'striped',
      });
      currentY = getLastTablePosition(doc) + 30;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(ReportDescriptions.summaryDesc, 15, currentY, { align: 'left' });
      currentY += 80;
    }

    // Section 2: Top Income and Expense Categories (Pie Charts)
    if (financialData.topIncomeCategoryData) {
      createHeading(doc, 'Top Income Categories', currentY);
      currentY += 20;
      createDescription(doc, ReportDescriptions.topIncomeCatDescription, currentY);
      currentY += 20;

      autoTable(doc, {
        head: [['Category', 'Amount']],
        body: financialData.topIncomeCategoryData.map((item) => [item.name, item.value]),
        startY: currentY,
        theme: 'grid',
      });

      currentY = getLastTablePosition(doc) + 70;
      currentY = checkToAddPage(currentY, doc, 200);
    }

    if (financialData.topExpensesCategoryData) {
      createHeading(doc, 'Top Expense Categories', currentY);
      currentY += 20;
      createDescription(doc, ReportDescriptions.topExpenseCatDescription, currentY);
      currentY += 20;

      autoTable(doc, {
        head: [['Category', 'Amount']],
        body: financialData.topExpensesCategoryData.map((item) => [item.name, item.value]),
        startY: currentY,
        theme: 'grid',
      });

      currentY = getLastTablePosition(doc) + 50;
      currentY = checkToAddPage(currentY, doc, 200);
    }

    // Section 3: Top Incomes and Expenses  (area charts and table)
    if (financialData.topIncomesData) {
      createHeading(doc, 'Top Income Transaction', currentY);
      currentY += 20;
      createDescription(doc, ReportDescriptions.topIncomeTransDescription, currentY);
      currentY += 20;

      autoTable(doc, {
        head: [['Date', 'Amount', 'Payee']],
        body: financialData.topIncomesData.map((item) => [
          format(item.date, 'PPP'),
          `$${item.amount}`,
          item.payee,
        ]),
        startY: currentY,
        theme: 'grid',
      });

      currentY = getLastTablePosition(doc) + 50;
      currentY = checkToAddPage(currentY, doc, 200);
    }

    if (financialData.topExpensesData) {
      createHeading(doc, 'Top Expense Transaction', currentY);
      currentY += 20;
      createDescription(doc, ReportDescriptions.topExpenseTransDescription, currentY);
      currentY += 20;

      autoTable(doc, {
        head: [['Date', 'Amount', 'Payee']],
        body: financialData.topExpensesData.map((item) => [
          format(item.date, 'PPP'),
          `$${item.amount}`,
          item.payee,
        ]),
        startY: currentY,
        theme: 'grid',
      });

      // check to add Page
      currentY = getLastTablePosition(doc) + 50;
      currentY = checkToAddPage(currentY, doc, 200);
    }

    // Section 4: Categories and Budgets
    if (financialData.CategoriesBudgetData) {
      createHeading(doc, 'Categories and Budgets', currentY);
      currentY += 20;
      createDescription(doc, ReportDescriptions.categoryBudgetDescription, currentY);
      currentY += 20;

      const categoriesTable = financialData.CategoriesBudgetData.map((item) => [
        item.name,
        `$${item.budget}`,
        `$${item.income}`,
        `$${item.expense}`,
      ]);

      autoTable(doc, {
        head: [['Category', 'Budget', 'Income', 'Expense']],
        body: categoriesTable,
        startY: currentY,
        theme: 'grid',
      });

      // check to add Page
      currentY = getLastTablePosition(doc) + 50;
      currentY = checkToAddPage(currentY, doc, 200);
    }

    // Section 4: Charts for Active Periods
    if (financialData.activePeriods) {
      createHeading(doc, 'Trends Over Time', currentY);
      currentY += 20;
      createDescription(doc, ReportDescriptions.trendsDescription, currentY);
      currentY += 20;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'medium');
      for (const period of financialData.activePeriods) {
        const { dateTrunc, activePeriodData } = period;

        const removedEmptyTransaction = activePeriodData.filter(
          (item) => !(item.income === 0 && item.expenses === 0)
        );
        doc.text(`${getTrendDescription(dateTrunc)}`, 50, currentY, {
          align: 'left',
        });

        currentY += 15;

        autoTable(doc, {
          head: [['Date', 'Income', 'Expenses']],
          body: removedEmptyTransaction.map((item) => [
            format(item.date, 'PPP'),
            `$${item.income}`,
            `$${item.expenses}`,
          ]),
          startY: currentY,
          theme: 'grid',
        });

        // check to add Page
        currentY = getLastTablePosition(doc) + 50;
        currentY = checkToAddPage(currentY, doc);
      }
    }

    //Section 5: Bills
    if (financialData.billsData) {
      createHeading(doc, 'Bills', currentY);

      currentY += 20;
      createDescription(doc, ReportDescriptions.billsDescription, currentY);
      currentY += 20;

      const billsTable = financialData.billsData?.map((item) => [
        item.name,
        `${item.amount}`,
        item.status,
        format(item.dueDate, 'PPP'),
      ]);

      autoTable(doc, {
        head: [['Name', 'Amount', 'Status', 'Due Date']],
        body: billsTable,
        startY: currentY,
        theme: 'grid',
      });
    }
    doc.save('Financial_Report.pdf');
  };

  const handleDownload = (type: DOWNLOAD_TYPE) => {
    if (plan === 'free') {
      toast.info('Please upgrade  your plan to download finacial report');
      setOpen(true);
      return;
    }

    if (type === DOWNLOAD_TYPE.JSON) {
      downLoadJSON(financialData, 'finacial-report.json');
    }

    if (type === DOWNLOAD_TYPE.PDF) {
      generateFinancialReportPDF();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="lg:w-auto h-9 cursor-pointer rounded-md px-3 text-white hover:text-white bg-white/10 hover:bg-white/20 focus:bg-white/30 font-normal border-none focus:ring-offset-0 outline-none focus-visible:ring-transparent transition"
        disabled={false}
        asChild
      >
        <div className="flex items-center text-sm gap-2">
          <Download className="size-4" />
          <span>Download</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload(DOWNLOAD_TYPE.JSON)}>
          <div className="flex items-center text-md cursor-pointer gap-2">
            <Download className="size-4" />
            <span>Download JSON</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload(DOWNLOAD_TYPE.PDF)}>
          <div className="flex items-center text-md cursor-pointer gap-2">
            <Download className="size-4" />
            <span>Download PDF</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SummaryDownload;
