const apiKey = "8996e24ffd218e65dff6d905ebc14eab";
const weatherInfo = document.getElementById("weatherInfo");
const forecastDiv = document.getElementById("forecast");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

// تحميل المدينة الأخيرة عند فتح التطبيق
window.addEventListener("load", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(lastCity);
    getForecast(lastCity);
  }
});

// البحث عند الضغط على زر أو Enter
searchBtn.addEventListener("click", searchWeather);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWeather();
});

function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    weatherInfo.innerHTML = "<p>من فضلك أدخل اسم المدينة.</p>";
    forecastDiv.innerHTML = "";
    return;
  }

  // حفظ المدينة الأخيرة
  localStorage.setItem("lastCity", city);

  getWeather(city);
  getForecast(city);
}

// 🌤️ الطقس الحالي
async function getWeather(city) {
  try {
    weatherInfo.innerHTML = "<p>جارٍ جلب بيانات الطقس...</p>";
    forecastDiv.innerHTML = "";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ar`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      weatherInfo.innerHTML = `<p>❌ لم يتم العثور على المدينة (ادخل اسم المدينه صحيح)</p>`;
      forecastDiv.innerHTML = "";
      return;
    }

    const { temp, humidity, pressure, temp_min, temp_max } = data.main;
    const desc = data.weather[0].description;
    const mainWeather = data.weather[0].main.toLowerCase();
    const icon = data.weather[0].icon;
    const wind = data.wind.speed;
    const clouds = data.clouds.all;

    // إنشاء عناصر DOM
    weatherInfo.innerHTML = "";
    const cityName = document.createElement("h2");
    cityName.textContent = data.name;

    const weatherIcon = document.createElement("img");
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = desc;

    const descP = document.createElement("p");
    descP.innerHTML = `<strong>الوصف:</strong> ${desc}`;

    const tempP = document.createElement("p");
    tempP.innerHTML = `<strong>درجة الحرارة:</strong> ${temp.toFixed(1)}°C (🥶 ${temp_min.toFixed(1)}°C / 🌡️ ${temp_max.toFixed(1)}°C)`;

    const humidityP = document.createElement("p");
    humidityP.innerHTML = `<strong>الرطوبة:</strong> ${humidity}%`;

    const pressureP = document.createElement("p");
    pressureP.innerHTML = `<strong>الضغط:</strong> ${pressure} hPa`;

    const windP = document.createElement("p");
    windP.innerHTML = `<strong>الرياح:</strong> ${wind} م/ث`;

    const cloudsP = document.createElement("p");
    cloudsP.innerHTML = `<strong>الغيوم:</strong> ${clouds}%`;

    weatherInfo.append(cityName, weatherIcon, descP, tempP, humidityP, pressureP, windP, cloudsP);

    changeBackground(mainWeather);

  } catch (error) {
    weatherInfo.innerHTML = `<p>حدث خطأ أثناء جلب البيانات.</p>`;
    console.error(error);
  }
}

// 🌈 التوقعات اليومية للأيام القادمة مع الدرجة الصغرى والكبرى
async function getForecast(city) {
  try {
    forecastDiv.innerHTML = "<p>جارٍ جلب التوقعات...</p>";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ar`
    );
    const data = await response.json();

    if (data.cod !== "200") {
      forecastDiv.innerHTML = "<p>تعذر جلب التوقعات.</p>";
      return;
    }

    const today = new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "short" });

    // تجميع البيانات لكل يوم
    const dailyData = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "short" });
      if (!dailyData[date]) dailyData[date] = [];
      dailyData[date].push(item);
    });

    forecastDiv.innerHTML = "<h3>التوقعات لـ 3 أيام قادمة:</h3><div class='forecast-days'></div>";
    const forecastDays = forecastDiv.querySelector(".forecast-days");

    let count = 0;
    for (const date in dailyData) {
      if (date === today) continue; // تجاهل اليوم الحالي
      if (count >= 3) break; // عرض 3 أيام فقط

      const dayData = dailyData[date];
      const temps = dayData.map(d => d.main.temp);
      const minTemp = Math.min(...temps).toFixed(1);
      const maxTemp = Math.max(...temps).toFixed(1);
      const desc = dayData[0].weather[0].description;
      const icon = dayData[0].weather[0].icon;

      const dayDiv = document.createElement("div");
      dayDiv.className = "day";
      dayDiv.innerHTML = `
        <h4>${date}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
        <p>${desc}</p>
        <p>🌡️ ${maxTemp}°C / 🥶 ${minTemp}°C</p>
      `;
      forecastDays.appendChild(dayDiv);
      count++;
    }

  } catch (error) {
    console.error(error);
    forecastDiv.innerHTML = "<p>تعذر جلب التوقعات.</p>";
  }
}

// 🌈 تغيير الخلفية حسب نوع الطقس
function changeBackground(condition) {
  const body = document.body;
  if (condition.includes("clear")) {
    body.style.background = "linear-gradient(to bottom, #f9d423, #ff4e50)";
  } else if (condition.includes("cloud")) {
    body.style.background = "linear-gradient(to bottom, #bdc3c7, #2c3e50)";
  } else if (condition.includes("rain")) {
    body.style.background = "linear-gradient(to bottom, #667db6, #0082c8, #0082c8, #667db6)";
  } else if (condition.includes("storm") || condition.includes("thunder")) {
    body.style.background = "linear-gradient(to bottom, #232526, #414345)";
  } else if (condition.includes("snow")) {
    body.style.background = "linear-gradient(to bottom, #e0eafc, #cfdef3)";
  } else {
    body.style.background = "linear-gradient(to bottom, #4facfe, #00f2fe)";
  }
}
