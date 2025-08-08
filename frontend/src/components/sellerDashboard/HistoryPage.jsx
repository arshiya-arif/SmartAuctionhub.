import React from "react";

const HistoryPage = () => {
  const historyData = [
    { id: 1, product: "Smartphone", buyer: "John Doe", date: "2023-10-01", amount: "$500" },
    { id: 2, product: "Laptop", buyer: "Jane Smith", date: "2023-09-25", amount: "$1200" },
    { id: 3, product: "Headphones", buyer: "Alice Johnson", date: "2023-09-20", amount: "$150" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Product
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Buyer
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition duration-200">
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{item.product}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{item.buyer}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{item.date}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;


