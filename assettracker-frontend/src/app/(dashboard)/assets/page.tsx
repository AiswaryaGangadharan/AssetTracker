import React from 'react';

export const metadata = {
  title: 'Assets List | AssetTracker',
  description: 'Manage all company assets',
};

export default function AssetsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Company Assets</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Asset
        </button>
      </div>
      <div className="bg-white rounded-lg shadow border p-6">
        {/* TODO: Implement Asset Table using Shadcn UI and React Query */}
        <p className="text-gray-500">Asset list table will be populated here from /api/assets</p>
      </div>
    </div>
  );
}
