import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Cart = ({ CartProduct, setCartProduct }) => {
  const [quantities, setQuantities] = useState([]);
  const [backendTotal, setBackendTotal] = useState(0);
  const [showAddress, setShowAddress] = useState(false);


  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [paymentMethod] = useState("COD");
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // ---------------- FETCH CART ----------------
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get("https://digimartx-backend.onrender.com/carts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const carts = res.data.cart
          ? res.data.cart.products.map((item) => ({
              id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image,
              description: item.product.description,
              quantity: item.quantity,
            }))
          : [];

        setCartProduct(carts);
        setQuantities(carts.map((i) => i.quantity));
        setBackendTotal(
          carts.reduce((s, i) => s + i.price * i.quantity, 0)
        );
      } catch {
        toast.error("Failed to load cart",{ autoClose: 300});
      }
    };
    fetchCart();
  }, [token, setCartProduct]);

  // ---------------- UPDATE QTY ----------------
  const updateQuantity = async (index, qty) => {
    if (qty < 1) return;

    const product = CartProduct[index];

    await axios.put(
      "https://digimartx-backend.onrender.com/carts",
      { productId: product.id, quantity: qty },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = CartProduct.map((p, i) =>
      i === index ? { ...p, quantity: qty } : p
    );

    setCartProduct(updated);
    setQuantities(updated.map((i) => i.quantity));
    setBackendTotal(updated.reduce((s, i) => s + i.price * i.quantity, 0));
  };

  // ---------------- REMOVE ----------------
  const handleRemove = async (id, index) => {
    await axios.delete(`https://digimartx-backend.onrender.com/carts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updated = CartProduct.filter((_, i) => i !== index);
    setCartProduct(updated);
    setQuantities(updated.map((i) => i.quantity));
    setBackendTotal(updated.reduce((s, i) => s + i.price * i.quantity, 0));
  };

  // ---------------- CHECKOUT ----------------
 const handleCheckout = async () => {
  try {
    // 1️⃣ Validate address on frontend
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
    ];

    for (let field of requiredFields) {
      if (!shippingAddress[field]) {
        toast.error(`Please fill ${field}`,{ autoClose: 250});
        return;
      }
    }

    // 2️⃣ Place order
    const res = await axios.post(
      "https://digimartx-backend.onrender.com/orders",
      {
        shippingAddress,
        paymentMethod,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    setCartProduct([]);
    setQuantities([]);
    setBackendTotal(0);

    toast.success("Order placed successfully",{ autoClose: 250});
    navigate("/order");
  } catch (error) {
    console.error("Checkout failed:", error.response?.data || error.message);

    toast.error(
      error.response?.data?.message || "Checkout failed. Try again",{ autoClose: 250}
    );
  }
};


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-indigo-900 text-center mb-6">
        Cart
      </h1>

      <div className="flex gap-10">
        {/* CART ITEMS */}
        <div className="w-2/3 bg-indigo-100 p-6 rounded-2xl shadow-lg">
          {CartProduct.length === 0 && (
            <p className="text-center font-semibold text-indigo-700">
              Your cart is empty
            </p>
          )}

          {CartProduct.map((p, i) => (
            <div
              key={p.id}
              className="flex gap-4 items-center bg-white p-4 rounded-xl shadow mb-4"
            >
              <img
                src={p.image}
                className="w-24 h-24 object-cover rounded-md"
              />

              <div className="flex-1">
                <h2 className="font-bold text-indigo-900">{p.name}</h2>
                <p className="text-gray-600">{p.description}</p>
                <p className="font-bold mt-1">
                  ₹{p.price * quantities[i]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(i, quantities[i] - 1)}
                  className="h-8 w-8 border rounded-full"
                >
                  -
                </button>
                <span className="font-semibold">{quantities[i]}</span>
                <button
                  onClick={() => updateQuantity(i, quantities[i] + 1)}
                  className="h-8 w-8 border rounded-full"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleRemove(p.id, i)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
          <div className="w-1/3 bg-indigo-100 p-6 rounded-2xl shadow-lg h-fit">
            <h2 className="text-xl font-bold text-center mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-indigo-900">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>₹{backendTotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹50</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600">20%</span>
              </div>

              <hr className="border-indigo-300" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₹{Math.round((backendTotal * 0.8)+50)}
                </span>
              </div>
            </div>

            <button
              disabled={CartProduct.length === 0}
              onClick={() => { setShowAddress(true);
                      setTimeout(() => {
                        document.getElementById("address-section")?.scrollIntoView({
                          behavior: "smooth", });
                      }, 100);
                    }}

              className="w-full mt-6 bg-indigo-900 text-white py-2 rounded-lg disabled:opacity-50"
            >
              Checkout
            </button>

          </div>
          </div>
          {showAddress && (
              <div id="address-section" className="w-full mt-10 bg-indigo-100 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(shippingAddress).map(
                    (key) =>
                      key !== "country" && (
                        <div key={key} className="flex flex-col">
                          <label className="text-sm font-semibold text-indigo-800 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </label>
                          <input
                            placeholder={`Enter ${key}`}
                            value={shippingAddress[key]}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                [key]: e.target.value,
                              })
                            }
                            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      )
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-8 bg-indigo-900 hover:bg-indigo-800 transition text-white py-3 rounded-xl font-semibold"
                >
                  Place Order
                </button>
              </div>
            )}

    </div>
  );
};

export default Cart;
