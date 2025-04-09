$(document).ready(function() {
    // Загрузка автомобилей с сервера
    function loadCars() {
        $.get("/api/cars", function(carObjects) {
            main(carObjects);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Ошибка загрузки:", textStatus, errorThrown);
            showMessage("Ошибка загрузки данных", "error");
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
                
                var $button = $("<button>").attr("type", "submit").text("Сохранить");
                $form.append($button);
                
                $form.on("submit", function(e) {
                    e.preventDefault();
                    
                    var newCar = {
                        "licensePlate": $("#licensePlate").val(),
                        "parkingSpot": $("#parkingSpot").val(),
                        "date": $("#date").val(),
                        "owner": $("#owner").val()
                    };
                    
                    // Определяем, это добавление или редактирование
                    var isEdit = $("#licensePlate").is(":disabled");
                    var url = isEdit ? "/api/cars/" + $("#licensePlate").val() : "/api/cars";
                    var method = isEdit ? "PUT" : "POST";
                    
                    $.ajax({
                        url: url,
                        type: method,
                        contentType: "application/json",
                        data: JSON.stringify(newCar),
                        success: function(response) {
                            $form[0].reset();
                            $("#licensePlate").prop("disabled", false);
                            $form.find("h3").text("Добавить новый автомобиль");
                            $content.append($("<p>").text(
                                isEdit ? "Автомобиль успешно обновлен!" : "Автомобиль успешно добавлен!"
                            ).css("color", "green"));
                            loadCars();
                        },
                        error: function(xhr) {
                            var errorMsg = xhr.responseJSON && xhr.responseJSON.error 
                                ? xhr.responseJSON.error 
                                : "Ошибка при сохранении данных";
                            $content.append($("<p>").text(errorMsg).css("color", "red"));
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
            var $card = $("<div>")
                .addClass("car-card")
                .attr("data-license", car.licensePlate);
                
            $card.append($("<h3>").text(car.licensePlate));
            $card.append($("<p>").html("<strong>Парковочное место:</strong> " + car.parkingSpot));
            $card.append($("<p>").html("<strong>Дата стоянки:</strong> " + new Date(car.date).toLocaleDateString()));
            $card.append($("<p>").html("<strong>Владелец:</strong> " + car.owner));
            
            // Добавляем кнопки редактирования и удаления
            var $editBtn = $("<button>").addClass("edit-btn").text("Редактировать");
            var $deleteBtn = $("<button>").addClass("delete-btn").text("Удалить");
            
            $card.append($editBtn).append($deleteBtn);
            
            return $card;
        }
        
        // Обработчик для кнопки удаления
        $(document).on("click", ".delete-btn", function(e) {
            e.stopPropagation();
            
            var $btn = $(this);
            var $card = $btn.closest(".car-card");
            var licensePlate = $card.attr("data-license");
            
            // Если кнопка уже обрабатывается - выходим
            if ($btn.hasClass("processing")) return;
            
            $btn.addClass("processing").text("Удаление...");
            
            $.ajax({
                url: "/api/cars/" + licensePlate,
                type: "DELETE",
                success: function(deletedCar) {
                    $card.fadeOut(300, function() {
                        $(this).remove();
                        showMessage("Автомобиль " + licensePlate + " успешно удален", "success");
                    });
                },
                error: function(xhr) {
                    var errorMsg = xhr.responseJSON && xhr.responseJSON.error 
                        ? xhr.responseJSON.error 
                        : "Ошибка при удалении автомобиля";
                    showMessage(errorMsg, "error");
                },
                complete: function() {
                    $btn.removeClass("processing").text("Удалить");
                }
            });
        });

        // Обработчик для кнопки редактирования
        $(document).on("click", ".edit-btn", function() {
            var licensePlate = $(this).closest(".car-card").attr("data-license");
            
            // Загружаем данные автомобиля
            $.get("/api/cars/" + licensePlate, function(car) {
                // Переключаемся на вкладку "Добавить" (которая будет работать и для редактирования)
                $(".tabs a:nth-child(5) span").click();
                
                // Заполняем форму данными
                var $form = $(".content form");
                $form.find("#licensePlate").val(car.licensePlate).prop("disabled", true);
                $form.find("#parkingSpot").val(car.parkingSpot);
                $form.find("#date").val(new Date(car.date).toISOString().split('T')[0]);
                $form.find("#owner").val(car.owner);
                
                // Изменяем заголовок
                $form.find("h3").text("Редактировать автомобиль");
            }).fail(function() {
                showMessage("Ошибка загрузки данных автомобиля", "error");
            });
        });
        
        $(".tabs a:first-child span").trigger("click");
    }
    
    // Функция для показа сообщений
    function showMessage(text, type) {
        var $msg = $("<div>").addClass("message " + type).text(text);
        $(".container").prepend($msg);
        setTimeout(function() {
            $msg.fadeOut(500, function() {
                $(this).remove();
            });
        }, 3000);
    }
    
    // Первоначальная загрузка данных
    loadCars();
});