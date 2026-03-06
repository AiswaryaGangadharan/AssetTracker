type SidebarProps = {
  role: "admin" | "employee"
}

export default function Sidebar({ role }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-6">AssetTracker</h2>

      <ul className="space-y-3">
        <li>Dashboard</li>
        <li>Assets</li>
        <li>Employees</li>

        {role === "admin" && (
          <>
            <li>Create Asset</li>
            <li>Delete Asset</li>
          </>
        )}
      </ul>
    </div>
  )
}