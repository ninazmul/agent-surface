"use client";

const PrintButton = () => {
  return (
    <div className="flex justify-end my-4 no-print">
      <button
        onClick={() => window.print()}
        className="bg-primary-500 hover:bg-primary-900 text-white px-4 py-2 rounded"
      >
        Print Invoice
      </button>
    </div>
  );
};

export default PrintButton;
