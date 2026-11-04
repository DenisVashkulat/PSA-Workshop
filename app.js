const $ = (selector) => document.querySelector(selector);

function showMessage(target, message, type = "success") {
  const element = $(target);
  if (!element) return;
  element.textContent = message;
  element.style.color = type === "error" ? "#ff987f" : "#5ac49b";
}

function normalizeVin(value) {
  return value.toUpperCase().replace(/\s+/g, "");
}

function getSavedVehicle() {
  try { return JSON.parse(sessionStorage.getItem("psaWorkshopVehicle") || "null"); }
  catch (_) { return null; }
}

function getCatalogUrl(make) {
  if (make === "Peugeot") return "https://7zap.com/ru/catalog/cars/peugeot/";
  if (make === "Citroën") return "https://7zap.com/ru/catalog/cars/citroen/";
  return "https://7zap.com/";
}

$("#vinInput")?.addEventListener("input", (event) => {
  event.target.value = normalizeVin(event.target.value).replace(/[^A-HJ-NPR-Z0-9]/g, "");
});

$("#vinForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const vin = normalizeVin($("#vinInput").value);
  if (vin.length !== 17) {
    showMessage("#vinResult", "Проверьте VIN: необходимо ровно 17 допустимых символов.", "error");
    return;
  }
  showMessage("#vinResult", "Формат VIN корректен. Автоматическая расшифровка пока не подключена: для получения модели, двигателя и комплектации нужен проверенный источник данных.");
});

$("#vehicleForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const make = $("#make").value;
  const model = $("#model").value.trim();
  if (!make || !model) {
    showMessage("#vehicleResult", "Укажите марку и модель автомобиля.", "error");
    return;
  }
  const vehicle = {
    make,
    model,
    year: $("#year").value.trim(),
    engine: $("#engine").value.trim()
  };
  try {
    sessionStorage.setItem("psaWorkshopVehicle", JSON.stringify(vehicle));
  } catch (_) {}
  showMessage("#vehicleResult", "Автомобиль выбран для текущего сеанса. Каталожные данные пока не подключены.");
});

$("#partsForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = $("#partQuery").value.trim();
  if (!query) {
    showMessage("#partsResult", "Введите VIN, оригинальный номер или название детали.", "error");
    return;
  }
  const vehicle = getSavedVehicle();
  const make = vehicle?.make || "";
  const catalogUrl = getCatalogUrl(make);
  const searchUrl = "https://www.google.com/search?q=" + encodeURIComponent("site:7zap.com " + (make ? make + " " : "") + query);
  const result = $("#partsResult");
  result.textContent = "";
  const message = document.createElement("p");
  message.textContent = "Поиск подготовлен для запроса: «" + query + "». Сверяйте применяемость по VIN/OPR в оригинальном каталоге.";
  const catalog = document.createElement("a");
  catalog.href = catalogUrl;
  catalog.target = "_blank";
  catalog.rel = "noopener";
  catalog.textContent = "Открыть каталог " + (make || "Peugeot / Citroën") + " на 7zap ↗";
  const search = document.createElement("a");
  search.href = searchUrl;
  search.target = "_blank";
  search.rel = "noopener";
  search.textContent = "Искать запрос в 7zap ↗";
  result.append(message, catalog, document.createTextNode(" · "), search);
  result.style.color = "#5ac49b";
});

const pageNames = {
  home: "Обзор",
  vehicle: "Автомобиль / VIN",
  wiring: "Электросхемы",
  parts: "Каталог запчастей",
  technical: "Тех. информация",
  resources: "Источники данных"
};

function navigate() {
  const section = location.hash.replace("#", "") || "home";
  document.querySelectorAll(".content-section").forEach((item) => {
    item.style.display = item.id === section ? "block" : "none";
  });
  $(".main-content").style.display = section === "home" ? "block" : "none";
  $("#currentPage").textContent = pageNames[section] || "Обзор";
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.section === section);
  });
  $("#sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", navigate);
$("#menuButton")?.addEventListener("click", () => $("#sidebar").classList.toggle("open"));
document.querySelectorAll("[data-section]").forEach((link) => {
  link.addEventListener("click", () => {
    const section = link.dataset.section;
    if (location.hash === "#" + section) navigate();
  });
});
navigate();