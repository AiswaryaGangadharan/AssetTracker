import React from 'react';

export const metadata = {
  title: 'Employees Directory | AssetTracker',
};

export default function EmployeesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      <div className="bg-white rounded-lg shadow border p-6">
        {/* TODO: Implement Employees Grid/Table using Shadcn UI */}
        <p className="text-gray-500">Employee directory and their assigned assets overview.</p>
      </div>
    </div>
  );
}
