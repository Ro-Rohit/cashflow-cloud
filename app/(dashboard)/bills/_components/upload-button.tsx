import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { NextPage } from 'next';
import { useCSVReader } from 'react-papaparse';
import { toast } from 'sonner';

interface Props {
  onUpload: (value: any) => void;
  plan: 'free' | 'pro' | 'unlimited';
  setPlanModalOpen: (value: boolean) => void;
}

const UploadButton: NextPage<Props> = ({ onUpload, plan, setPlanModalOpen }) => {
  const { CSVReader } = useCSVReader();
  const handleUpload = (value: any) => {
    if (plan === 'free' || plan === 'pro') {
      toast.info("Please upgrade  your plan to 'UNLIMITED-SAAS' to import bills");
      setPlanModalOpen(true);
      return;
    }
    onUpload(value);
  };

  return (
    <CSVReader onUploadAccepted={handleUpload}>
      {({ getRootProps }: any) => (
        <>
          <Button className="w-full sm:w-auto" type="button" {...getRootProps()}>
            <div className="flex items-center">
              <Upload className=" size-4 text-white" />
              <span className="ml-2 text-white">Import</span>
            </div>
          </Button>
        </>
      )}
    </CSVReader>
  );
};

export default UploadButton;
