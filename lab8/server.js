const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");

const app = express();

// Подключение к MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/carparking", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Успешное подключение к MongoDB");
    } catch (err) {
        console.error("Ошибка подключения к MongoDB:", err);
        process.exit(1);
    }
}

// Схема и модель автомобиля
const carSchema = new mongoose.Schema({
    licensePlate: { type: String, required: true, unique: true },
    parkingSpot: { type: String, required: true },
    date: { type: Date, required: true },
    owner: { type: String, required: true }
}, { versionKey: false });

const Car = mongoose.model("Car", carSchema);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роуты API

// GET все автомобили
app.get("/api/cars", async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET автомобиль по госномеру
app.get("/api/cars/:licensePlate", async (req, res) => {
    try {
        const car = await Car.findOne({ licensePlate: req.params.licensePlate });
        if (!car) return res.status(404).send("Автомобиль не найден");
        res.json(car);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST добавление нового автомобиля
app.post("/api/cars", async (req, res) => {
    try {
        const { licensePlate, parkingSpot, date, owner } = req.body;
        
        if (!licensePlate || !parkingSpot || !date || !owner) {
            return res.status(400).send("Не все обязательные поля заполнены");
        }
        
        const newCar = new Car({ licensePlate, parkingSpot, date, owner });
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Автомобиль с таким госномером уже существует" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// PUT обновление автомобиля
app.put("/api/cars/:licensePlate", async (req, res) => {
    try {
        const { parkingSpot, date, owner } = req.body;
        
        if (!parkingSpot || !date || !owner) {
            return res.status(400).send("Не все обязательные поля заполнены");
        }
        
        const updatedCar = await Car.findOneAndUpdate(
            { licensePlate: req.params.licensePlate },
            { parkingSpot, date, owner },
            { new: true }
        );
        
        if (!updatedCar) return res.status(404).send("Автомобиль не найден");
        res.json(updatedCar);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE удаление автомобиля
app.delete("/api/cars/:licensePlate", async (req, res) => {
    try {
        const deletedCar = await Car.findOneAndDelete({ 
            licensePlate: req.params.licensePlate 
        });
        
        if (!deletedCar) return res.status(404).send("Автомобиль не найден");
        res.json(deletedCar);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET автомобили по парковочному месту
app.get("/api/cars/parking-spot/:spot", async (req, res) => {
    try {
        const cars = await Car.find({ parkingSpot: req.params.spot });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Запуск сервера
async function startServer() {
    await connectToDatabase();
    
    const server = http.createServer(app);
    server.listen(3000, () => {
        console.log("Сервер запущен на http://localhost:3000");
    });
    
    // Обработка завершения работы
    process.on("SIGINT", async () => {
        await mongoose.disconnect();
        console.log("Приложение завершило работу");
        process.exit();
    });
}

startServer().catch(err => {
    console.error("Ошибка запуска сервера:", err);
    process.exit(1);
});