import Sidebar from "@/components/layout/Sidebar"

export default function Home() {

  const role = "employee"// change to "employee" to test

  return (
    <div className="flex">
      <Sidebar role={role} />

      <main className="p-10">
        <h1 className="text-3xl font-bold">
          Welcome to AssetTracker Dashboard
        </h1>
      </main>
    </div>
  )
}