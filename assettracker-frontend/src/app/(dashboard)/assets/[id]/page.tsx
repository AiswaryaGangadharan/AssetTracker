import React from 'react';

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <a href="/assets" className="text-blue-500 hover:underline">&larr; Back to Assets</a>
      </div>
      <h1 className="text-2xl font-bold mb-4">Asset Details: {params.id}</h1>
      <div className="bg-white rounded-lg shadow border p-6">
        {/* TODO: Fetch single asset detail */}
        <p className="text-gray-500">Asset specific details, specification, and assignment history timeline.</p>
      </div>
    </div>
  );
}
