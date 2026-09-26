/* Golden route interaction reused with frozen map templates. */
let mapRoutes = [];
let mapInstance = 0;
const transportNames = {
  drive: "自驾", train: "火车", rail: "火车", "cable-car": "缆车",
  hike: "步行", walk: "步行", return: "返程", "rental-car": "租车",
  boat: "游船", ferry: "渡轮", flight: "飞行", transfer: "接驳"
};

function mapRouteDefinitions(source) {
  return routeLayersFor(source).map(({ day, color }) => ({ day, color }));
}

function dailyMapLayoutFor(source, dayNumber) {
  const authored = source.dailyLayouts?.[String(dayNumber)];
  if (authored) return { places: [], labels: {}, transport: [], ...authored };
  const route = routeLayersFor(source).find((candidate) => candidate.day === dayNumber);
  if (!route) return null;
  return { places: route.placeIds || [], labels: {}, transport: [] };
}

function placeOptions(source, placeId) {
  const place = placeLayersFor(source).find((item) => item.id === placeId);
  if (!place) return [[placeId, placeId]];
  if (Array.isArray(place.options) && place.options.length) return place.options.map((option) => [option.label, option.query]);
  return [[place.lines?.at(-1) || placeId, place.query || place.lines?.[0] || placeId]];
}

function scheduleItemsForPin(day, pin) {
  const references = Array.isArray(pin?.itemIds) && pin.itemIds.length ? pin.itemIds : pin?.items || [];
  return references.map((reference) => typeof reference === "number"
    ? day.schedule[reference]
    : day.schedule.find((item) => item.id === reference)
  ).filter(Boolean);
}

function dailyViewportFor(source) {
  const canvas = source.canvas || { width: 1448, height: 1086 };
  return { x: 0, y: 0, width: canvas.width, height: canvas.height };
}

function transportIcon(type) {
  const icons = {
    drive: '<path d="m5 9 2-5h10l2 5M4 9h16v9H4zM7 18v2m10-2v2M7 12h1m8 0h1"/>',
    "cable-car": '<path d="m2 4 20-2M12 3v5M6 9h12l2 9H4zM6 18v3h12v-3M9 9v9m6-9v9"/>',
    train: '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 10h14M12 3v7m-4 5h1m6 0h1M8 18l-3 4m11-4 3 4M7 20h10"/>',
    hike: '<circle cx="14" cy="4" r="2"/><path d="m11 8 4 2 3 4m-7-6-3 6-4 1m7-3 3 4-1 6m-2-10-3 7-4 3M8 8l-2 3"/>',
    boat: '<path d="M12 3v11M5 7h14v6M3 14l9-3 9 3-3 6H6zM2 22q3-3 5 0 3-3 5 0 3-3 5 0 3-3 5 0"/>',
    "rental-car": '<path d="m3 10 2-5h9l2 5M2 10h15v8H2zM5 18v2m9-2v2M5 13h1m7 0h1M18 4h4m-2-2 2 2-2 2"/>',
    flight: '<path d="M3 16 21 8M9 13 5 6l2-1 6 5m2-1 1-6 2-1 1 5M8 15l-1 4 2-1 3-4"/>'
  };
  const key = type === "rail" ? "train" : type === "ferry" ? "boat" : type === "walk" ? "hike" : ["return", "transfer"].includes(type) ? "drive" : type;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[key] || icons.drive}</svg>`;
}

function mapArtwork(source, selected, id, viewport) {
  if (!selected) return travelOverviewArtwork(state.data.days, source);
  const layout = dailyMapLayoutFor(source, selected.day);
  const day = state.data.days.find((item) => item.day === selected.day);
  const doc = new DOMParser().parseFromString(travelOverviewArtwork(state.data.days, source, { includeAllPlaces: true, useDetailedRoutes: true }), "image/svg+xml");
  const svg = doc.documentElement;
  svg.removeAttribute("data-overview-version");
  svg.setAttribute("data-daily-version", "3");
  svg.setAttribute("aria-label", day.title);
  svg.querySelector("title").textContent = day.title;
  svg.querySelector("desc").textContent = "仅显示当天路线；地点圆点打开地图，交通图标查看行程。";
  svg.querySelectorAll('[id^="overview-route-"]').forEach((group) => {
    if (group.id !== `overview-route-${selected.day}`) group.remove();
  });
  ["overview-date-legend", "overview-markers", "overview-geographic-names"].forEach((key) => svg.querySelector(`#${key}`)?.remove());
  svg.querySelectorAll('[id^="overview-label-"]').forEach((label) => {
    const placeId = label.id.replace("overview-label-", "");
    if (!layout?.places.includes(placeId)) { label.remove(); return; }
    const place = placeLayersFor(source).find((item) => item.id === placeId);
    const labelLayout = layout.labels?.[placeId] || { x: place?.tx, y: place?.ty, anchor: place?.anchor };
    if (!Number.isFinite(Number(labelLayout.x)) || !Number.isFinite(Number(labelLayout.y))) { label.remove(); return; }
    label.setAttribute("x", labelLayout.x);
    label.setAttribute("y", labelLayout.y);
    label.setAttribute("text-anchor", labelLayout.anchor || "start");
    label.querySelectorAll("tspan").forEach((line) => line.setAttribute("x", labelLayout.x));
  });
  svg.querySelectorAll("[id]").forEach((element) => { element.id = `${id}-${element.id}`; });
  return new XMLSerializer().serializeToString(svg);
}

function dailyPointRole(layout, placeId, index) {
  if (layout.roles?.[placeId]) return layout.roles[placeId];
  if (layout.places.length === 1) return "起点 / 终点";
  if (index === 0) return "起点";
  if (index === layout.places.length - 1) return "终点";
  return "途经点";
}

function leafletPlaceName(placeId) {
  const place = (state.data?.places || []).find((item) => item.id === placeId);
  return place?.nameZh || place?.name || placeId;
}

function googleMapsRouteUrl(route) {
  const mapPlaces = state.data?.map?.places || [];
  if (route?.day) {
    const day = state.data.days.find((d) => d.day === route.day);
    const ids = []; const seen = new Set();
    (day?.schedule || []).forEach((item) => { if (item.placeId && !seen.has(item.placeId)) { seen.add(item.placeId); ids.push(item.placeId); } });
    const stops = ids.map((id) => { const p = mapPlaces.find((mp) => mp.id === id); return p?.geo && Number.isFinite(Number(p.geo.lat)) ? `${p.geo.lat},${p.geo.lng}` : encodeURIComponent(leafletPlaceName(id)); });
    if (stops.length >= 2) return `https://www.google.com/maps/dir/${stops.join("/")}`;
    if (stops.length === 1) return `https://www.google.com/maps/search/?api=1&query=${stops[0]}`;
  }
  return mapsSearch(state.data?.trip?.primaryDestinationName || "胡志明市 富国岛");
}

const stepTypeNames = {
  flight: "✈️ 飞机", transfer: "🚗 Grab/接驳", walk: "🚶 步行", drive: "🚗 自驾",
  train: "🚆 火车", rail: "🚆 火车", ferry: "⛴️ 渡轮", boat: "⛴️ 游船",
  "cable-car": "🚡 缆车", return: "↩️ 返程", hike: "🚶 徒步",
  attraction: "🏛️ 景点", restaurant: "🍜 用餐", "check-in": "🏨 入住", "check-out": "🏨 退房",
  rest: "😴 休息", note: "📝 备注"
};

function placeButtons(place) {
  if (!place) return "";
  const btns = [];
  if (place.mapQuery) {
    btns.push(`<a class="pbtn pbtn-nav" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery)}" target="_blank" rel="noopener noreferrer" title="到越南后可用">📍导航</a>`);
  }
  if (place.bookingUrl) {
    const isTicket = ["honthom", "kissbridge"].includes(place.id);
    btns.push(`<a class="pbtn pbtn-book" href="${place.bookingUrl}" target="_blank" rel="noopener noreferrer">${isTicket ? "🎫买票" : "🕐预约"}</a>`);
  }
  if (place.detailUrl) btns.push(`<a class="pbtn pbtn-detail" href="${place.detailUrl}" target="_blank" rel="noopener noreferrer">🔗详情</a>`);
  if (place.mapQuery) {
    btns.push(`<button type="button" class="pbtn" data-ask-driver="${escapeHtml(place.id)}">🗣️给司机看</button>`);
    btns.push(`<button type="button" class="pbtn" data-copy-addr="${escapeHtml(place.id)}">📋复制</button>`);
    btns.push(`<button type="button" class="pbtn" data-grab="${escapeHtml(place.id)}">🚗Grab</button>`);
  }
  return `<div class="place-btns">${btns.join("")}</div>`;
}

function placeMetaLines(place) {
  if (!place) return "";
  const lines = [];
  if (place.hours) lines.push(`<div class="tl-meta">⏰ ${escapeHtml(place.hours)}</div>`);
  if (place.ticket) lines.push(`<div class="tl-meta">🎫 ${escapeHtml(place.ticket)}</div>`);
  if (place.note) lines.push(`<div class="tl-meta tl-meta-note">ℹ️ ${escapeHtml(place.note)}</div>`);
  return lines.join("");
}

function renderRouteSteps(dayNumber) {
  if (!dayNumber) return "";
  const day = state.data.days.find((d) => d.day === dayNumber);
  if (!day || !day.schedule?.length) return "";
  const typeClass = {
    flight: "tl-flight", transfer: "tl-transfer", walk: "tl-walk", drive: "tl-transfer",
    train: "tl-transfer", rail: "tl-transfer", ferry: "tl-transfer", boat: "tl-transfer",
    "cable-car": "tl-transfer", return: "tl-transfer", hike: "tl-walk",
    attraction: "tl-walk", restaurant: "tl-food", "check-in": "tl-hotel", "check-out": "tl-hotel",
    rest: "tl-rest", note: "tl-note"
  };
  const typeIcon = {
    flight: "✈️", transfer: "🚗", walk: "🚶", drive: "🚗", train: "🚆", rail: "🚆",
    ferry: "⛴️", boat: "⛴️", "cable-car": "🚡", return: "↩️", hike: "🚶",
    attraction: "🏛️", restaurant: "🍜", "check-in": "🏨", "check-out": "🧳", rest: "😴", note: "📝"
  };
  const steps = day.schedule.map((s) => {
    const place = s.placeId ? (state.data.places || []).find((p) => p.id === s.placeId) : null;
    const tips = [];
    if (place?.howTo) tips.push(`<div class="tip-row tip-how"><span class="tip-ico">💡</span><span class="tip-label">怎么玩</span><span class="tip-body">${escapeHtml(place.howTo)}</span></div>`);
    if (place?.cost) tips.push(`<div class="tip-row tip-cost"><span class="tip-ico">💰</span><span class="tip-label">花费</span><span class="tip-body">${escapeHtml(place.cost)}</span></div>`);
    if (place?.rainPlan) tips.push(`<div class="tip-row tip-rain"><span class="tip-ico">🌧️</span><span class="tip-label">雨天</span><span class="tip-body">${escapeHtml(place.rainPlan)}</span></div>`);
    const placeName = place?.name ? `<div class="tl-place">📍 ${escapeHtml(place.name)}</div>` : "";
    const meta = placeMetaLines(place);
    const btns = placeButtons(place);
    return `<li class="tl-item ${typeClass[s.type] || "tl-note"}">
      <div class="tl-time">${escapeHtml(s.time)}</div>
      <div class="tl-rail"><span class="tl-dot">${typeIcon[s.type] || "📝"}</span></div>
      <div class="tl-card"><div class="tl-text">${escapeHtml(s.text)}</div>${placeName}${meta}${tips.join("")}${btns}</div>
    </li>`;
  }).join("");
  let foodStrip = "";
  const foodSteps = day.schedule.map((s, i) => ({ s, i })).filter(({ s }) => s.type === "restaurant" && s.placeId);
  if (foodSteps.length > 1) {
    const chips = foodSteps.map(({ s, i }) => {
      const p = (state.data.places || []).find((x) => x.id === s.placeId);
      return `<button type="button" class="food-chip" data-food-day="${day.day}" data-food-idx="${i}">${p?.name || s.text}</button>`;
    }).join("");
    foodStrip = `<div class="food-pick"><span class="food-pick-title">🍽️ 今天吃什么</span>${chips}<button type="button" class="food-dice" data-food-dice="${day.day}">🎲 帮我选</button></div>`;
  }
  return `<div class="route-steps">
    <h3 class="route-steps-title">${day.date.slice(5).replace("-", "/")} · ${escapeHtml(day.title)}</h3>
    ${foodStrip}
    <ol class="timeline">${steps}</ol>
  </div>`;
}

function travelMapMarkup(source, route) {
  const gmapsUrl = googleMapsRouteUrl(route);
  return `<div class="travel-map-block ${route ? "is-daily" : "is-overview"}">
    <div class="leaflet-map-host" id="route-leaflet-map" data-leaflet-day="${route ? route.day : 0}"></div>
    <button type="button" class="map-expand-btn" data-map-expand>🔍 放大查看地图</button>
    <div class="map-utility"><span>${route ? "当天路线 · 点标记看地点" : "真实地图 · 点标记看地点"}</span><a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:600;color:#1a73e8;margin-left:10px">在 Google 地图中打开 ↗</a></div>
  </div>`;
}

function renderLeafletMap(dayNumber) {
  const host = document.getElementById("route-leaflet-map");
  if (!host || !window.L) return;
  const mapPlaces = state.data?.map?.places || [];
  const mapRoutes = state.data?.map?.routes || [];
  const map = L.map(host, { scrollWheelZoom: false });
  const isMobile = window.matchMedia("(max-width: 699px)").matches;
  if (isMobile) {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
  }
  const mapBlock = host.closest(".travel-map-block");
  const setMapExpand = (on) => {
    mapBlock?.classList.toggle("is-expanded", on);
    const btn = mapBlock?.querySelector("[data-map-expand]");
    if (btn) btn.textContent = on ? "✕ 收起地图" : "🔍 放大查看地图";
    if (isMobile) {
      map.dragging[on ? "enable" : "disable"]();
      map.touchZoom[on ? "enable" : "disable"]();
      map.doubleClickZoom[on ? "enable" : "disable"]();
    }
    setTimeout(() => map.invalidateSize(), 80);
  };
  mapBlock?.addEventListener("click", (event) => {
    if (!isMobile) return;
    if (event.target.closest("a, .leaflet-interactive, .leaflet-control")) return;
    setMapExpand(!mapBlock.classList.contains("is-expanded"));
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
  const latlngs = [];
  if (dayNumber) {
    const day = state.data.days.find((d) => d.day === dayNumber);
    const ids = [];
    const seen = new Set();
    (day?.schedule || []).forEach((item) => {
      if (item.placeId && !seen.has(item.placeId)) {
        seen.add(item.placeId);
        const p = mapPlaces.find((mp) => mp.id === item.placeId);
        if (p?.geo && Number.isFinite(Number(p.geo.lat))) ids.push(item.placeId);
      }
    });
    ids.forEach((id, i) => {
      const p = mapPlaces.find((mp) => mp.id === id);
      const ll = [p.geo.lat, p.geo.lng];
      latlngs.push(ll);
      const icon = L.divIcon({ className: "route-number-marker", html: `<span>${i + 1}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] });
      L.marker(ll, { icon }).addTo(map).bindPopup(`<b>${i + 1}. ${escapeHtml(leafletPlaceName(id))}</b>`);
    });
    for (let i = 0; i < ids.length - 1; i++) {
      const a = mapPlaces.find((mp) => mp.id === ids[i]);
      const b = mapPlaces.find((mp) => mp.id === ids[i + 1]);
      if (a?.geo && b?.geo) L.polyline([[a.geo.lat, a.geo.lng], [b.geo.lat, b.geo.lng]], { color: "#e11d48", weight: 3, dashArray: "6 5" }).addTo(map);
    }
  } else {
    mapPlaces.filter((p) => p.geo && Number.isFinite(Number(p.geo.lat))).forEach((p) => {
      latlngs.push([p.geo.lat, p.geo.lng]);
      L.circleMarker([p.geo.lat, p.geo.lng], { radius: 8, color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.75, weight: 2 }).addTo(map).bindPopup(`<b>${escapeHtml(leafletPlaceName(p.id))}</b>`);
    });
    mapRoutes.forEach((r) => {
      const pts = (r.placeIds || []).map((id) => mapPlaces.find((p) => p.id === id)).filter((p) => p?.geo).map((p) => [p.geo.lat, p.geo.lng]);
      if (pts.length >= 2) L.polyline(pts, { color: "#e11d48", weight: 2.5, dashArray: "6 5" }).addTo(map);
    });
  }
  if (latlngs.length >= 2) map.fitBounds(latlngs, { padding: [40, 40] });
  else if (latlngs.length === 1) map.setView(latlngs[0], 14);
  else map.setView([10.4, 104.8], 7);
}

function activateDayMaps(root) {
  $$(".is-daily .travel-map-scroll", root).forEach((view) => {
    if (view.dataset.positioned || !view.clientWidth) return;
    view.scrollLeft = 0;
    view.dataset.positioned = "true";
  });
}

function renderRoutePanel(regionId, dayNumber = 0) {
  const root = $("#route-explorer");
  const routeMap = state.data?.routeMap;
  const regions = travelMapRegions(routeMap);
  const source = travelMapSource(routeMap, regionId || routeMap?.defaultRegionId || root.dataset.region);
  root.dataset.region = source.id || "";
  mapRoutes = (state.data?.days || []).map((d) => ({ day: d.day, color: "#e11d48" }));
  const route = mapRoutes.find((item) => item.day === dayNumber);
  root.innerHTML = `<div class="route-region-tabs" aria-label="旅行国家">${regions.map((region) => `<button type="button" data-route-region="${escapeHtml(region.id)}" aria-pressed="${region.id === source.id}">${escapeHtml(region.label || region.heading?.text || region.id)}</button>`).join("")}</div>
  <div class="route-day-tabs" aria-label="${escapeHtml(source.label || "当前国家")}路线日期"><button type="button" data-route-day="0" aria-pressed="${!route}">总览</button>${mapRoutes.map((item) => { const day = state.data.days.find((candidate) => candidate.day === item.day); return day ? `<button type="button" data-route-day="${item.day}" style="--route-color:${item.color}" aria-pressed="${item === route}"><i></i>${day.date.slice(5).replace("-", "/")}</button>` : ""; }).join("")}</div>${travelMapMarkup(source, route)}${renderRouteSteps(dayNumber)}`;
  renderLeafletMap(route ? route.day : 0);
}

function setupRouteExplorer() {
  renderRoutePanel();
  let activePin = null;
  let popover = null;
  const closePopover = (restoreFocus = false) => {
    const opener = activePin;
    if (opener) { opener.setAttribute("aria-expanded", "false"); opener.removeAttribute("aria-controls"); }
    popover?.remove(); popover = null; activePin = null;
    if (restoreFocus) opener?.focus({ preventScroll: true });
  };
  const positionPopover = () => {
    if (!popover || !activePin) return;
    const point = activePin.getBoundingClientRect();
    popover.style.left = `${Math.max(8, Math.min(innerWidth - popover.offsetWidth - 8, point.left + point.width / 2 - popover.offsetWidth / 2))}px`;
    popover.style.top = `${Math.max(8, Math.min(innerHeight - popover.offsetHeight - 8, point.top - popover.offsetHeight - 10))}px`;
  };
  const showPopover = (pin, content, map = false) => {
    const wasOpen = activePin === pin; closePopover(); if (wasOpen) return;
    activePin = pin; pin.setAttribute("aria-expanded", "true"); pin.setAttribute("aria-controls", "route-active-popover");
    popover = document.createElement("section"); popover.id = "route-active-popover"; popover.className = `route-popover ${map ? "route-place-popover" : "transport-popover"}`;
    popover.setAttribute("role", "dialog"); popover.setAttribute("aria-label", map ? "地点 Google Maps" : "交通信息");
    popover.innerHTML = `<button type="button" class="route-popover-close" data-close-route-popover aria-label="关闭">×</button>${content}`;
    (pin.closest("dialog") || document.body).append(popover); positionPopover();
    popover.querySelector("[data-close-route-popover]").focus({ preventScroll: true });
  };
  document.addEventListener("click", (event) => {
    const region = event.target.closest("[data-route-region]");
    const dayButton = event.target.closest("[data-route-day]");
    if (region || dayButton) {
      closePopover();
      const selectedRegionId = region?.dataset.routeRegion || $("#route-explorer").dataset.region;
      renderRoutePanel(selectedRegionId, region ? 0 : Number(dayButton?.dataset.routeDay || 0));
      return;
    }
    if (event.target.closest("[data-close-route-popover]")) { closePopover(true); return; }
    const placePin = event.target.closest("[data-place-id]");
    if (placePin) {
      const source = travelMapSource(state.data?.routeMap, placePin.dataset.mapRegion);
      const options = placeOptions(source, placePin.dataset.placeId);
      const [label, query] = options[0];
      showPopover(placePin, `<header><small>${escapeHtml(placePin.dataset.placeRole)}</small><strong data-popup-place-label>${escapeHtml(label)}</strong></header>
        ${options.length > 1 ? `<div class="popup-place-options">${options.map(([name, value], index) => `<button type="button" data-popup-query="${escapeHtml(value)}" data-popup-label="${escapeHtml(name)}" aria-pressed="${index === 0}">${escapeHtml(name)}</button>`).join("")}</div>` : ""}
        <iframe title="${escapeHtml(label)} Google Maps" src="https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        <footer><a data-popup-external href="${mapsSearch(query)}" target="_blank" rel="noopener noreferrer">用 Google Maps 打开 ↗</a><small>页内地图供查看，实际导航以地图服务结果为准。</small></footer>`, true);
      return;
    }
    const pin = event.target.closest("[data-transport-day]");
    if (pin) {
      const day = state.data.days.find((item) => item.day === Number(pin.dataset.transportDay));
      const source = travelMapSource(state.data?.routeMap, pin.dataset.mapRegion);
      const group = dailyMapLayoutFor(source, day.day).transport[Number(pin.dataset.transportGroup)];
      showPopover(pin, scheduleItemsForPin(day, group).map((item) => `<div class="transport-leg"><strong>${escapeHtml(transportNames[item.type] || "交通")} · ${escapeHtml(item.time)}</strong><p>${escapeHtml(item.text)}</p></div>`).join(""));
      return;
    }
    const option = event.target.closest("[data-popup-query]");
    if (option && popover) {
      const query = option.dataset.popupQuery;
      const label = option.dataset.popupLabel;
      $$("[data-popup-query]", popover).forEach((button) => button.setAttribute("aria-pressed", String(button === option)));
      $("[data-popup-place-label]", popover).textContent = label;
      const frame = $("iframe", popover); frame.title = `${label} Google Maps`; frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
      $("[data-popup-external]", popover).href = mapsSearch(query);
      return;
    }
    if (event.target.closest(".route-popover")) return;
    closePopover();
    const zoom = event.target.closest("[data-expand-map]");
    if (zoom) {
      const dialog = $("#map-dialog");
      const source = document.getElementById(zoom.dataset.expandMap);
      const copy = source.cloneNode(true);
      const svg = copy.querySelector("svg");
      const ids = [...svg.querySelectorAll("[id]")].map((element) => element.id);
      for (const oldId of ids) svg.innerHTML = svg.innerHTML.replaceAll(`id="${oldId}"`, `id="${oldId}-zoom"`).replaceAll(`url(#${oldId})`, `url(#${oldId}-zoom)`);
      copy.removeAttribute("id"); copy.classList.toggle("daily-fullscreen", Boolean(source.closest(".is-daily")));
      copy.style.setProperty("--route-color", getComputedStyle(source).getPropertyValue("--route-color"));
      $("#map-dialog-content").replaceChildren(copy); dialog.showModal();
      const viewport = $("#map-dialog-content"); viewport.scrollLeft = Math.max(0, (copy.scrollWidth - viewport.clientWidth) / 2);
    }
    const link = event.target.closest("[data-open-day]");
    if (link) {
      event.preventDefault();
      const button = $(`[data-day="${Number(link.dataset.openDay)}"] .day-toggle`);
      if (button.getAttribute("aria-expanded") !== "true") button.click();
      button.scrollIntoView({ behavior: "smooth" });
    }
    const toggle = event.target.closest(".day-toggle");
    if (toggle && toggle.getAttribute("aria-expanded") === "true") activateDayMaps(toggle.closest(".day-card"));
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && activePin) { event.preventDefault(); event.stopPropagation(); closePopover(true); } });
  window.addEventListener("resize", positionPopover);
  document.addEventListener("scroll", (event) => { if (!event.target.closest?.(".route-popover")) positionPopover(); }, true);
  document.addEventListener("focusin", (event) => { if (popover && !popover.contains(event.target) && event.target !== activePin) closePopover(); });
  window.addEventListener("travel-view:shown", () => {
    const roots = [$("#route-explorer"), ...$$(".day-detail:not([hidden])")].filter(Boolean);
    roots.forEach((root) => {
      $$(".is-daily .travel-map-scroll", root).forEach((view) => view.removeAttribute("data-positioned"));
      activateDayMaps(root);
    });
  });
  $("#map-close").onclick = () => $("#map-dialog").close();
  $("#map-dialog").addEventListener("close", () => closePopover());
  $$(".day-detail:not([hidden])").forEach(activateDayMaps);
}

/* ==== 便捷按钮：问路卡 / 复制 / Grab / 吃什么（2026-09-26） ==== */
const VC_MODAL_HTML = `
<div class="vc-overlay" id="vc-overlay" hidden>
  <div class="vc-card" role="dialog" aria-modal="true" aria-label="给司机看的地址">
    <div class="vc-lang">🇻🇳 请给司机 / 店员看这张卡</div>
    <div class="vc-name" id="vc-name"></div>
    <div class="vc-addr" id="vc-addr"></div>
    <div class="vc-cn" id="vc-cn"></div>
    <button type="button" class="vc-close" data-vc-close>✕ 关闭</button>
  </div>
</div>`;
if (!document.getElementById("vc-overlay")) {
  document.body.insertAdjacentHTML("beforeend", VC_MODAL_HTML);
}
function showToast(msg) {
  let t = document.getElementById("tl-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "tl-toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  window.clearTimeout(t._timer);
  t._timer = window.setTimeout(() => t.classList.remove("show"), 2600);
}
document.addEventListener("click", (event) => {
  const ov = document.getElementById("vc-overlay");
  const ask = event.target.closest("[data-ask-driver]");
  if (ask) {
    const p = (state.data.places || []).find((x) => x.id === ask.dataset.askDriver);
    if (p && ov) {
      document.getElementById("vc-name").textContent = p.nameVi || p.name || "";
      document.getElementById("vc-addr").textContent = p.addressVi || "";
      document.getElementById("vc-cn").textContent = "中文：(" + (p.name || "") + ")";
      ov.hidden = false;
    }
    return;
  }
  const copy = event.target.closest("[data-copy-addr]");
  const grab = event.target.closest("[data-grab]");
  if (copy || grab) {
    const el = copy || grab;
    const pid = el.dataset.copyAddr || el.dataset.grab;
    const p = (state.data.places || []).find((x) => x.id === pid);
    const txt = [p?.nameVi, p?.addressVi].filter(Boolean).join(" · ");
    if (txt && navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {});
    if (copy) { showToast("已复制：" + txt); return; }
    showToast("已复制地址，尝试打开Grab…若没反应，打开Grab粘贴搜索");
    window.setTimeout(() => { try { window.location.href = "grab://"; } catch (e) { /* 无App则提示 */ } }, 500);
    return;
  }
  const vcClose = event.target.closest("[data-vc-close]");
  if (vcClose || (ov && event.target === ov)) { if (ov) ov.hidden = true; return; }
  const dice = event.target.closest("[data-food-dice]");
  if (dice) {
    const day = Number(dice.dataset.foodDice);
    const chips = [...document.querySelectorAll(`.food-chip[data-food-day="${day}"]`)];
    if (!chips.length) return;
    chips.forEach((c) => c.classList.remove("is-picked"));
    const winChip = chips[Math.floor(Math.random() * chips.length)];
    winChip.classList.add("is-picked");
    showToast("就吃这家 🍽️ " + winChip.textContent.trim());
    return;
  }
  const chip = event.target.closest(".food-chip");
  if (chip) {
    const day = Number(chip.dataset.foodDay);
    const idx = Number(chip.dataset.foodIdx);
    document.querySelectorAll(".food-chip").forEach((c) => c.classList.remove("is-picked"));
    chip.classList.add("is-picked");
    const li = document.querySelectorAll(".tl-item")[idx];
    if (li) {
      li.scrollIntoView({ behavior: "smooth", block: "center" });
      li.classList.add("flash");
      window.setTimeout(() => li.classList.remove("flash"), 1600);
    }
    return;
  }
});