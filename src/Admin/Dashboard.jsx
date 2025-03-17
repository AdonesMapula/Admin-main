import React, { useEffect, useState } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs, query, orderBy, limit, where, startAt, endAt, Timestamp } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [merchSalesData, setMerchSalesData] = useState([]);
  const [ticketSalesData, setTicketSalesData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("month");


const getDateRange = (filter) => {
  const now = new Date();
  let startDate;

  if (filter === "week") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (filter === "month") {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
  } else if (filter === "year") {
    startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);
  }

  return { startDate: Timestamp.fromDate(startDate), endDate: Timestamp.fromDate(now) };
};

  const fetchProducts = async () => {
    try {
      const { startDate, endDate } = getDateRange(timeFilter);
      
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate),
        orderBy("createdAt", "desc")
      );
  
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, orderBy("year", "desc"), limit(3));
      const querySnapshot = await getDocs(q);

      const eventData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchMerchSales = async () => {
    try {
      const soldItemsRef = collection(db, "solditems");
      const querySnapshot = await getDocs(soldItemsRef);
  
      const salesMap = new Map();
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.cartItems) {
          data.cartItems.forEach((item) => {
            if (salesMap.has(item.name)) {
              salesMap.set(item.name, salesMap.get(item.name) + item.quantity);
            } else {
              salesMap.set(item.name, item.quantity);
            }
          });
        }
      });
  
      const salesArray = Array.from(salesMap, ([name, sales]) => ({ name, sales }));
      
      setMerchSalesData(salesArray);
    } catch (error) {
      console.error("Error fetching merchandise sales data:", error);
    }
  };

  const fetchTicketSales = async () => {
    try {
      const soldTicketsRef = collection(db, "soldtickets");
      const querySnapshot = await getDocs(soldTicketsRef);
  
      const salesMap = new Map();
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventDate && data.quantity) {
          const month = new Date(data.eventDate).toLocaleString("default", { month: "short" });
  
          if (salesMap.has(month)) {
            salesMap.set(month, salesMap.get(month) + data.quantity);
          } else {
            salesMap.set(month, data.quantity);
          }
        }
      });
  
      const salesArray = Array.from(salesMap, ([name, tickets]) => ({ name, tickets }));
  
      setTicketSalesData(salesArray);
    } catch (error) {
      console.error("Error fetching ticket sales data:", error);
    }
  };
  
  useEffect(() => {
    fetchProducts();
    fetchMerchSales();
    fetchTicketSales();
    fetchEvents();
  }, [timeFilter]); 
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <div className="mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center">
            <span className="inline-block transform -skew-x-12 bg-white text-black px-3 py-1 mr-3">RAPOLLO</span>
            DASHBOARD
          </h1>
          <p className="text-gray-400 mt-2 italic">Dashboard </p>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Top Merch Sold This Month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={merchSalesData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="sales" fill="red" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Ticket Sales (Last 4 Months)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ticketSalesData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="red" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-10">
        <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
        <ul className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id} className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <p className="text-gray-400">{event.year} - {event.description}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No recent events available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
