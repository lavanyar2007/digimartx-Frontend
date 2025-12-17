import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const paymentColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const deliveryColors = {
  pending: "bg-gray-200 text-gray-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};



const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // ---------------- FETCH ORDERS ----------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3000/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Fetch orders failed:", error.response?.data);
        toast.error("Failed to load orders",);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center text-lg font-semibold text-gray-600">
        Loading orders...
      </div>
    );
  }

  // ---------------- EMPTY STATE ----------------
  if (!orders.length) {
    return (
      <div className="max-w-4xl mx-auto p-10 mt-20 text-center bg-indigo-50 rounded-2xl shadow-lg">
        <p className="text-xl font-bold text-indigo-800">
          You haven’t placed any orders yet
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-indigo-900 text-white px-6 py-2 rounded-xl hover:bg-indigo-800 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ---------------- ORDERS LIST ----------------
  return (
  <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-4xl font-extrabold text-center mb-12 text-indigo-900">
      Your Orders
    </h1>

    <div className="space-y-10">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border p-8 transition hover:shadow-2xl"
        >
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
            <div>
              <p className="text-xl font-bold text-indigo-900">
                {order.orderNumber}
              </p>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>

              <p className="mt-2 text-sm">
                Payment Method:{" "}
                <span className="font-semibold text-indigo-800">
                  {order.paymentMethod}
                </span>
              </p>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${paymentColors[order.paymentStatus]}`}
              >
                💳 {order.paymentStatus.toUpperCase()}
              </span>

              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${deliveryColors[order.deliveryStatus]}`}
              >
                🚚 {order.deliveryStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="mt-8 space-y-5">
            {order.products.map((item) => (
              <div
                key={item.product._id}
                className="flex flex-col md:flex-row items-center gap-6 border rounded-2xl p-5 hover:bg-indigo-50 transition"
              >
                <img
                  src={`/${item.product.image}`}
                  className="w-28 h-28 object-cover rounded-xl shadow"
                />

                <div className="flex-1">
                  <p className="text-lg font-semibold text-indigo-900">
                    {item.product.name}
                  </p>
                  <p className="text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="font-bold text-indigo-800 mt-1">
                    ₹{item.product.price * item.quantity}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/products/${item.product.id}`)
                  }
                  className="px-6 py-2 bg-indigo-900 text-white rounded-full hover:bg-indigo-800 transition"
                >
                  View Product
                </button>
              </div>
            ))}
          </div>

          {/* DELIVERY STATUS */}
          {order.deliveryStatus === "cancelled" ? (
            <div className="mt-10 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 text-white text-2xl shadow">
                ❌
              </div>

              <div>
                <p className="text-lg font-bold text-red-700">
                  Order Cancelled
                </p>
                <p className="text-sm text-red-600">
                  This order has been cancelled and will not be delivered.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-12">
              <p className="text-sm font-bold mb-6 text-indigo-900">
                Delivery Progress
              </p>

              <div className="relative flex items-center justify-between">
                {/* BASE LINE */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded -z-10" />

                {/* ACTIVE LINE */}
                <div
                  className={`absolute top-1/2 left-0 h-1 bg-green-500 rounded -z-10 transition-all duration-700 ${
                    order.deliveryStatus === "pending"
                      ? "w-0"
                      : order.deliveryStatus === "shipped"
                      ? "w-1/2"
                      : "w-full"
                  }`}
                />

                {/* STEP 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow">
                    🕒
                  </div>
                  <span className="mt-2 text-xs font-semibold">
                    Order Placed
                  </span>
                </div>

                {/* STEP 2 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow ${
                      ["shipped", "delivered"].includes(order.deliveryStatus)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    📦
                  </div>
                  <span className="mt-2 text-xs font-semibold">
                    Shipped
                  </span>
                </div>

                {/* STEP 3 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow ${
                      order.deliveryStatus === "delivered"
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    🏠
                  </div>
                  <span className="mt-2 text-xs font-semibold">
                    Delivered
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-10 pt-6 border-t flex justify-between items-center">
            <span className="text-xl font-bold text-indigo-900">
              Total Amount
            </span>
            <span className="text-3xl font-extrabold text-indigo-900">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);


};

export default Orders;
