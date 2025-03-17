import React, { useEffect, useState, useRef } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Dialog } from "@headlessui/react";
import { FaCheck, FaTimes, FaUndo, FaTrash, FaDownload, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";


function TixMonitor() {
  const [soldTickets, setSoldTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const printRef = useRef();

  const exportToExcel = () => {
      const worksheetData = soldItems.map((item) => ({
        "Transaction ID": item.transactionId,
        "Buyer Name": item.fullName,
        "Email": item.email,
        "Phone": item.phone,
        "Shipping Address": item.shippingAddress,
        "Payment Method": item.paymentMethod,
        "Total Amount": item.totalAmount,
        "Order Date": item.orderDate,
        "Status": item.status || "Pending",
        "Items Purchased": item.cartItems
          .map(cartItem => `${cartItem.name} (Size: ${cartItem.size}, Qty: ${cartItem.quantity})`)
          .join(", "),
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sold Items");
    
      // Create an Excel file and trigger download
      XLSX.writeFile(workbook, "Sold_Items.xlsx");
    };
    const printReport = () => {
      window.print();
    };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "soldtickets"));
        const ticketsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSoldTickets(ticketsData);
      } catch (error) {
        console.error("Error fetching tickets: ", error);
      }
    };
    fetchTickets();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const ticketRef = doc(db, "soldtickets", id);
      await updateDoc(ticketRef, { status: newStatus });
      setSoldTickets((prevTickets) =>
        prevTickets.map((ticket) => (ticket.id === id ? { ...ticket, status: newStatus } : ticket))
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const deleteTicket = async (id) => {
    try {
      await deleteDoc(doc(db, "soldtickets", id));
      setSoldTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error("Error deleting ticket: ", error);
    }
  };

  const openDialog = (ticket, action) => {
    setSelectedTicket({ ...ticket, action });
    setIsOpen(true);
  };

  const filteredTickets = soldTickets.filter((ticket) => {
    return (
      (filterStatus === "" || ticket.status === filterStatus) &&
      (searchQuery === "" || ticket.fullName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (dateRange.start === "" || ticket.purchaseDate >= dateRange.start) &&
      (dateRange.end === "" || ticket.purchaseDate <= dateRange.end)
    );
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
          <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight uppercase">
                <span className="inline-block transform -skew-x-12 bg-white text-black px-2 mr-2">Ticket</span>
                MANAGEMENT
              </h1>
              <p className="text-gray-400 mt-2 italic">Rapollo's Ticket Management</p>
            </div>
            <div className="flex space-x-4">
              <button onClick={exportToExcel} className="bg-white hover:bg-red-500 text-black cursor-pointer px-4 py-2 rounded flex items-center">
                <FaDownload className="mr-2" /> Download Excel
              </button>
              <button onClick={printReport} className="bg-black hover:bg-red-800 text-white cursor-pointer px-4 py-2 rounded flex items-center">
                <FaPrint className="mr-2" /> Print Report
              </button>
            </div>
          </header>

      {/* Filters */}
      <div className="mb-6 flex justify-between bg-gray-800 p-4 rounded-md">
        <input
          type="text"
          placeholder="Search by name..."
          className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-4">
          <select
            className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Sold Tickets Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border border-white text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border px-4 py-2">Sold to</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Contact</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Purchase Date</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Gcash Receipt</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="text-center bg-gray-900">
                <td className="border px-4 py-2">{ticket.fullName}</td>
                <td className="border px-4 py-2">{ticket.email}</td>
                <td className="border px-4 py-2">{ticket.phone}</td>
                <td className="border px-4 py-2">{ticket.quantity}</td>
                <td className="border px-4 py-2">{ticket.purchaseDate}</td>
                <td className="border px-4 py-2 font-bold">{ticket.status || "Pending"}</td>
                <td className="border px-4 py-2">
                  {ticket.receiptURL ? (
                    <a href={ticket.receiptURL} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                      View Receipt
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">No Receipt/COD</span>
                  )}
                </td>

                <td className="border px-4 py-2 flex justify-center gap-2">
                  <button onClick={() => openDialog(ticket, "Approved")} className="bg-white text-black p-2 rounded">
                    <FaCheck />
                  </button>
                  <button onClick={() => openDialog(ticket, "Declined")} className="bg-black p-2 rounded">
                    <FaTimes />
                  </button>
                  <button onClick={() => openDialog(ticket, "Pending")} className="bg-gray-600 p-2 rounded">
                    <FaUndo />
                  </button>
                  {ticket.status === "Declined" && (
                    <button onClick={() => deleteTicket(ticket.id)} className="bg-red-800 p-2 rounded">
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-900 p-6 rounded-lg text-white">
          <p>Are you sure you want to {selectedTicket?.action} this ticket?</p>
          <div className="flex justify-end gap-4 mt-4">
            <button className="bg-white text-black border-2 border-gray-600 px-4 py-2 rounded" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="bg-black text-white px-4 py-2 rounded" onClick={() => updateStatus(selectedTicket.id, selectedTicket.action)}>Confirm</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default TixMonitor;
