const express = require("express");
const http = require("http");
const app = express();
const path = require("path");

let cars = [
    {
        "licensePlate": "А123БВ777",
        "parkingSpot": "A12",
        "date": "2023-05-15",
        "owner": "Иванов Иван Иванович"
    },
    {
        "licensePlate": "В456ГД123",
        "parkingSpot": "B05",
        "date": "2023-05-16",
        "owner": "Петров Петр Петрович"
    },
    {
        "licensePlate": "Е789ЖК456",
        "parkingSpot": "A12",
        "date": "2023-05-17",
        "owner": "Сидорова Анна Михайловна"
    },
    {
        "licensePlate": "М321НП789",
        "parkingSpot": "C03",
        "date": "2023-05-18",
        "owner": "Кузнецов Дмитрий Сергеевич"
    }
];

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET все автомобили
app.get("/api/cars", (req, res) => {
    res.json(cars);
});

// GET автомобиль по госномеру
app.get("/api/cars/:licensePlate", (req, res) => {
    const licensePlate = req.params.licensePlate;
    const car = cars.find(c => c.licensePlate === licensePlate);
    
    if (car) {
        res.json(car);
    } else {
        res.status(404).send("Автомобиль не найден");
    }
});

// POST добавление нового автомобиля
app.post("/api/cars", (req, res) => {
    if (!req.body.licensePlate || !req.body.parkingSpot || !req.body.date || !req.body.owner) {
        return res.status(400).send("Не все обязательные поля заполнены");
    }
    
    const newCar = {
        licensePlate: req.body.licensePlate,
        parkingSpot: req.body.parkingSpot,
        date: req.body.date,
        owner: req.body.owner
    };
    
    cars.push(newCar);
    res.status(201).json(newCar);
});

// GET автомобили по парковочному месту
app.get("/api/cars/parking-spot/:spot", (req, res) => {
    const spot = req.params.spot;
    const filteredCars = cars.filter(c => c.parkingSpot === spot);
    res.json(filteredCars);
});

const server = http.createServer(app);
server.listen(3000, () => {
    console.log("Сервер запущен на http://localhost:3000");
});