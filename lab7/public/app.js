$(document).ready(function() {
    // Загрузка автомобилей с сервера
    function loadCars() {
        $.get("/api/cars", function(carObjects) {
            main(carObjects);
        }).fail(function() {
            main([]);
        });
    }
    
    function main(carObjects) {
        // Организация по госномерам
        function organizeByLicensePlates(cars) {
            var plates = [];
            
            cars.forEach(function(car) {
                if (plates.indexOf(car.licensePlate) === -1) {
                    plates.push(car.licensePlate);
                }
            });
            
            var plateObjects = plates.map(function(plate) {
                var carsWithPlate = [];
                cars.forEach(function(car) {
                    if (car.licensePlate === plate) {
                        carsWithPlate.push(car);
                    }
                });
                return { "licensePlate": plate, "cars": carsWithPlate };
            });
            
            return plateObjects;
        }
        
        // Организация по парковочным местам
        function organizeByParkingSpots(cars) {
            var spots = [];
            
            cars.forEach(function(car) {
                if (spots.indexOf(car.parkingSpot) === -1) {
                    spots.push(car.parkingSpot);
                }
            });
            
            var spotObjects = spots.map(function(spot) {
                var carsWithSpot = [];
                cars.forEach(function(car) {
                    if (car.parkingSpot === spot) {
                        carsWithSpot.push(car);
                    }
                });
                return { "parkingSpot": spot, "cars": carsWithSpot };
            });
            
            return spotObjects;
        }

        // Обработчик кликов по вкладкам
        $(".tabs a span").on("click", function() {
            var $element = $(this),
                $content;
            
            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $(".content").empty();
            
            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<div>");
                for (var i = carObjects.length - 1; i >= 0; i--) {
                    var car = carObjects[i];
                    var $carCard = createCarCard(car);
                    $content.append($carCard);
                }
            } else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<div>");
                carObjects.forEach(function(car) {
                    var $carCard = createCarCard(car);
                    $content.append($carCard);
                });
            } else if ($element.parent().is(":nth-child(3)")) {
                var organizedByPlates = organizeByLicensePlates(carObjects);
                $content = $("<div>");
                
                organizedByPlates.forEach(function(group) {
                    var $groupHeader = $("<h2>").addClass("group-header")
                        .text("Госномер: " + group.licensePlate);
                    $content.append($groupHeader);
                    
                    group.cars.forEach(function(car) {
                        var $carCard = createCarCard(car);
                        $content.append($carCard);
                    });
                });
            } else if ($element.parent().is(":nth-child(4)")) {
                var organizedBySpots = organizeByParkingSpots(carObjects);
                $content = $("<div>");
                
                organizedBySpots.forEach(function(group) {
                    var $groupHeader = $("<h2>").addClass("group-header")
                        .text("Парковочное место: " + group.parkingSpot);
                    $content.append($groupHeader);
                    
                    group.cars.forEach(function(car) {
                        var $carCard = createCarCard(car);
                        $content.append($carCard);
                    });
                });
            } else if ($element.parent().is(":nth-child(5)")) {
                $content = $("<div>");
                
                var $form = $("<form>");
                $form.append($("<h3>").text("Добавить новый автомобиль"));
                
                var $licensePlateGroup = $("<div>").addClass("input-group");
                $licensePlateGroup.append($("<label>").attr("for", "licensePlate").text("Госномер:"));
                $licensePlateGroup.append($("<input>").attr("type", "text").attr("id", "licensePlate").attr("required", true));
                $form.append($licensePlateGroup);
                
                var $parkingSpotGroup = $("<div>").addClass("input-group");
                $parkingSpotGroup.append($("<label>").attr("for", "parkingSpot").text("Парковочное место:"));
                $parkingSpotGroup.append($("<input>").attr("type", "text").attr("id", "parkingSpot").attr("required", true));
                $form.append($parkingSpotGroup);
                
                var $dateGroup = $("<div>").addClass("input-group");
                $dateGroup.append($("<label>").attr("for", "date").text("Дата стоянки:"));
                $dateGroup.append($("<input>").attr("type", "date").attr("id", "date").attr("required", true));
                $form.append($dateGroup);
                
                var $ownerGroup = $("<div>").addClass("input-group");
                $ownerGroup.append($("<label>").attr("for", "owner").text("ФИО владельца:"));
                $ownerGroup.append($("<input>").attr("type", "text").attr("id", "owner").attr("required", true));
                $form.append($ownerGroup);
                
                var $button = $("<button>").attr("type", "submit").text("Добавить");
                $form.append($button);
                
                $form.on("submit", function(e) {
                    e.preventDefault();
                    
                    var newCar = {
                        "licensePlate": $("#licensePlate").val(),
                        "parkingSpot": $("#parkingSpot").val(),
                        "date": $("#date").val(),
                        "owner": $("#owner").val()
                    };
                    
                    // Отправка данных на сервер
                    $.ajax({
                        url: "/api/cars",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(newCar),
                        success: function(response) {
                            $form[0].reset();
                            $content.append($("<p>").text("Автомобиль успешно добавлен!").css("color", "green"));
                            loadCars(); // Перезагружаем данные
                        },
                        error: function() {
                            $content.append($("<p>").text("Ошибка при добавлении автомобиля").css("color", "red"));
                        }
                    });
                });
                
                $content.append($form);
            }
            
            $(".content").append($content);
            return false;
        });
        
        // Создание карточки автомобиля
        function createCarCard(car) {
            var $card = $("<div>").addClass("car-card");
            $card.append($("<h3>").text(car.licensePlate));
            $card.append($("<p>").html("<strong>Парковочное место:</strong> " + car.parkingSpot));
            $card.append($("<p>").html("<strong>Дата стоянки:</strong> " + car.date));
            $card.append($("<p>").html("<strong>Владелец:</strong> " + car.owner));
            return $card;
        }
        
        $(".tabs a:first-child span").trigger("click");
    }
    
    // Первоначальная загрузка данных
    loadCars();
});