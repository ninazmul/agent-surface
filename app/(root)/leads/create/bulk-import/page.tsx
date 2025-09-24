import LeadImport from "@/app/(root)/components/LeadImport";

const BulkImportLeadsPage = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          📥 Bulk Lead Import
        </h1>
        <p className="text-gray-600 dark:text-gray-100 mb-6 text-center">
          Upload an Excel file (<code>.xlsx</code> or <code>.xls</code>) with your leads. 
          Make sure it follows the required template.
        </p>
        <LeadImport />
      </div>
    </div>
  );
};

export default BulkImportLeadsPage;
