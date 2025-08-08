require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PythonShell } = require("python-shell");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const path = require("path");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const app = express();
const server = http.createServer(app); 
const paymentRoutes = require("./routes/paymentRoutes");

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("🔥 New Client Connected: ", socket.id);
  socket.on("placeBid", (data) => io.emit("newBid", data));
  socket.on("disconnect", () => console.log("❌ Client Disconnected:", socket.id));
});
app.set('io', io);
connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes(io)); // io passed here ✅
// Mount routers
app.use('/api', adminRoutes);
app.use("/api/reviews", reviewRoutes);
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes); 


const bidRoutes = require("./routes/bidRoutes")(io); // io passed here ✅
app.use("/api/bids", bidRoutes);

app.get("*", (req, res) => res.status(404).json({ message: "API route not found" }));




const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
