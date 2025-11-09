"use client";
import { useEffect, useState } from "react";
import Navbar from "./component/Navbar/Navbar";
import { getAppUrl } from "./function/getEnv";
import { useRouter } from "next/navigation";

export default function Home() {
  //const apiUrl = getAppUrl(process.env.NODE_ENV || "development");
  const appUrl = getAppUrl(process.env.NODE_ENV || "production");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/Login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/Login");
  };
  // Manual import handler
  const handlerFetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${apiUrl}/api/fetch-data`);
      await response.json();

      // Refresh import logs after import
      fetchImportLogs();
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch import logs
  const fetchImportLogs = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/import-logs`);
      const logs = await response.json();
      setData(logs);
      setCurrentPage(1); // Reset to first page on new data
    } catch (error) {
      console.error("Error fetching import logs:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchImportLogs();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          My Dashboard
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            📊 Dashboard
          </a>
          <button
            onClick={handlerFetchData}
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            {loading ? "⏳ Importing..." : "⬆️ Import Data"}
          </button>
          <a
            href="#"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            ⚙️ Settings
          </a>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button className="w-full py-2 text-sm bg-gray-800 rounded-lg hover:bg-gray-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-8 overflow-auto flex-1">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            File Import Summary
          </h1>

          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4 text-sm font-semibold">File Name</th>
                  <th className="p-4 text-sm font-semibold">Import Date Time</th>
                  <th className="p-4 text-sm font-semibold">Total</th>
                  <th className="p-4 text-sm font-semibold">New</th>
                  <th className="p-4 text-sm font-semibold">Update</th>
                  <th className="p-4 text-sm font-semibold">Failed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      ⏳ Importing data, please wait...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((log, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-4 text-gray-700">{log.fileName}</td>
                      <td className="p-4 text-gray-700">
                        {new Date(log.importDateTime).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-700">{log.totalFetched}</td>
                      <td className="p-4 text-green-600 font-medium">{log.totalNewRecords}</td>
                      <td className="p-4 text-blue-600 font-medium">{log.totalImported}</td>
                      <td className="p-4 text-red-600 font-medium">{log.totalFailed}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No import logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center bg-white border-t">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${currentPage === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-4 py-2 rounded-lg ${currentPage === totalPages || totalPages === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
