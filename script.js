const mapElement = document.querySelector("[data-map-canvas]");
const viewport = document.querySelector("[data-map-viewport]");
const stateLabel = document.querySelector("[data-state-label]");
const ratioLabel = document.querySelector("[data-ratio-label]");
const zoomLabel = document.querySelector("[data-zoom-label]");
const scaleLabel = document.querySelector("[data-scale]");

const scenicPoi = {
  name: "金鸡湖景区",
  center: { lat: 31.3135, lng: 120.7048 },
  fence: [
    { lat: 31.317946, lng: 120.678903 },
    { lat: 31.323079, lng: 120.687143 },
    { lat: 31.321906, lng: 120.699159 },
    { lat: 31.317653, lng: 120.712206 },
    { lat: 31.30856, lng: 120.724222 },
    { lat: 31.29888, lng: 120.726625 },
    { lat: 31.290812, lng: 120.720445 },
    { lat: 31.288318, lng: 120.706713 },
    { lat: 31.291545, lng: 120.692121 },
    { lat: 31.299613, lng: 120.682337 },
    { lat: 31.30768, lng: 120.67959 },
  ],
};

const regions = [
  {
    id: "chengpin", name: "诚品书店周边", choice: "57%人选择住这", price: 214,
    center: { lat: 31.3219, lng: 120.7218 },
    polygon: [
      { lat: 31.3258, lng: 120.716 }, { lat: 31.3262, lng: 120.728 },
      { lat: 31.3212, lng: 120.7315 }, { lat: 31.3182, lng: 120.7235 },
      { lat: 31.3204, lng: 120.7163 },
    ],
  },
  {
    id: "zhongtang", name: "中塘公园周边", choice: "24%人选择住这", price: 266,
    center: { lat: 31.3129, lng: 120.7246 },
    polygon: [
      { lat: 31.3168, lng: 120.7194 }, { lat: 31.3172, lng: 120.7305 },
      { lat: 31.3105, lng: 120.7338 }, { lat: 31.3076, lng: 120.724 },
      { lat: 31.3112, lng: 120.718 },
    ],
  },
  {
    id: "ligongdi", name: "李公堤周边", choice: "11%人选择住这", price: 127,
    center: { lat: 31.3032, lng: 120.7085 },
    polygon: [
      { lat: 31.3076, lng: 120.701 }, { lat: 31.3072, lng: 120.7136 },
      { lat: 31.3018, lng: 120.716 }, { lat: 31.2984, lng: 120.7088 },
      { lat: 31.3015, lng: 120.7002 },
    ],
  },
];

const gates = [
  { name: "西入口", point: { lat: 31.3169, lng: 120.6932 } },
  { name: "3号停车场", point: { lat: 31.3197, lng: 120.697 } },
  { name: "桃花岛", point: { lat: 31.3123, lng: 120.6974 } },
  { name: "南入口", point: { lat: 31.3047, lng: 120.7048 } },
];

const baseHotels = [
  { score: "3.2", price: 281, point: { lat: 31.3315, lng: 120.6958 }, region: null },
  { score: "4.9", price: 375, point: { lat: 31.3314, lng: 120.7098 }, region: null },
  { score: "4.6", price: 443, point: { lat: 31.3259, lng: 120.7052 }, region: null },
  { score: "4.1", price: 389, point: { lat: 31.3238, lng: 120.714 }, region: null },
  { score: "4.4", price: 891, point: { lat: 31.3255, lng: 120.728 }, region: null },
  { score: "4.8", price: 492, point: { lat: 31.3199, lng: 120.7115 }, region: "chengpin" },
  { score: "5.0", price: 379, point: { lat: 31.3181, lng: 120.7196 }, region: "chengpin" },
  { score: "4.6", price: 665, point: { lat: 31.3152, lng: 120.7242 }, region: "zhongtang" },
  { score: "4.6", price: 741, point: { lat: 31.3117, lng: 120.731 }, region: "zhongtang" },
  { score: "4.6", price: 578, point: { lat: 31.3068, lng: 120.7044 }, region: "ligongdi" },
  { score: "4.3", price: 2544, point: { lat: 31.3038, lng: 120.7102 }, region: "ligongdi" },
  { score: "4.9", price: 375, point: { lat: 31.3005, lng: 120.7018 }, region: "ligongdi" },
  { score: "5.0", price: 99, point: { lat: 31.296, lng: 120.707 }, region: null },
  { score: "4.9", price: 877, point: { lat: 31.2968, lng: 120.7204 }, region: null },
  { score: "4.8", price: 297, point: { lat: 31.2908, lng: 120.7064 }, region: null },
  { score: "4.4", price: 291, point: { lat: 31.2919, lng: 120.729 }, region: null },
  { score: "4.5", price: 112, point: { lat: 31.2864, lng: 120.693 }, region: null },
  { score: "4.1", price: 389, point: { lat: 31.2862, lng: 120.721 }, region: null },
];

const hotels = [
  ...baseHotels,
  ...createRandomHotels(180),
  ...regions.flatMap((region, index) => createRegionHotels(region, 28, 20260701 + index * 97)),
];

const stateNames = {
  S1: "S1 景区 + 推荐区域概览态",
  S2: "S2 推荐区域聚焦态",
  S2M: "S2-M 多推荐区域展开态",
  S3: "S3 普通酒店浏览态",
};

const mapState = {
  center: { lat: 31.3112, lng: 120.708 },
  zoom: 13,
  state: "S1",
  selectedRegion: null,
};

const overlay = document.createElement("div");
overlay.className = "custom-overlay";

let AMapApi = null;
let baseMap = null;
let zoomTimer = null;
let renderFrame = null;
let lastSettledZoom = mapState.zoom;

function createRandomHotels(count) {
  const random = seededRandom(20260608);
  const prices = [79, 87, 99, 112, 238, 259, 281, 291, 297, 341, 375, 389, 441, 443, 492, 578, 612, 665, 741, 877, 891, 2544];
  const generated = [];
  for (let index = 0; index < count; index += 1) {
    const point = { lat: 31.22 + random() * 0.18, lng: 120.64 + random() * 0.14 };
    const score = (3.2 + random() * 1.8).toFixed(1);
    const price = prices[Math.floor(random() * prices.length)];
    const region = regions.find((item) => pointInPolygon(point, item.polygon))?.id || null;
    generated.push({ score, price, point, region });
  }
  return generated;
}

function createRegionHotels(region, count, seed) {
  const random = seededRandom(seed);
  const prices = [99, 112, 168, 214, 238, 266, 291, 341, 375, 389, 443, 492, 578, 665, 741, 877];
  const lats = region.polygon.map((point) => point.lat);
  const lngs = region.polygon.map((point) => point.lng);
  const bounds = { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
  const generated = [];
  let attempts = 0;
  while (generated.length < count && attempts < count * 30) {
    attempts += 1;
    const point = {
      lat: bounds.minLat + random() * (bounds.maxLat - bounds.minLat),
      lng: bounds.minLng + random() * (bounds.maxLng - bounds.minLng),
    };
    if (!pointInPolygon(point, region.polygon)) continue;
    generated.push({
      score: (3.5 + random() * 1.5).toFixed(1),
      price: prices[Math.floor(random() * prices.length)], point, region: region.id,
    });
  }
  return generated;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const currentPoint = polygon[current];
    const previousPoint = polygon[previous];
    const intersects = currentPoint.lng > point.lng !== previousPoint.lng > point.lng &&
      point.lat < ((previousPoint.lat - currentPoint.lat) * (point.lng - currentPoint.lng)) /
        (previousPoint.lng - currentPoint.lng) + currentPoint.lat;
    if (intersects) inside = !inside;
  }
  return inside;
}

function loadAmap() {
  const config = window.AMAP_CONFIG || {};
  if (!window.AMapLoader || !config.key) {
    showMapError("高德地图加载配置缺失，请检查 Web JS API key。");
    return;
  }
  window.AMapLoader.load({ key: config.key, version: "2.0" })
    .then((AMap) => { AMapApi = AMap; initAmap(); })
    .catch((error) => {
      console.error(error);
      showMapError("高德地图加载失败。若这是新申请的 key，请补充 securityJsCode 安全密钥。");
    });
}

function initAmap() {
  baseMap = new AMapApi.Map("real-map", {
    center: toLngLat(mapState.center), zoom: mapState.zoom, zooms: [12, 17], viewMode: "2D",
    mapStyle: "amap://styles/normal", features: ["bg", "road", "building", "point"],
    resizeEnable: true, dragEnable: true, zoomEnable: true, scrollWheel: true,
    touchZoom: true, doubleClickZoom: true, jogEnable: false,
  });
  mapElement.append(overlay);
  baseMap.on("complete", render);
  baseMap.on("mapmove", scheduleRenderFromAmap);
  baseMap.on("zoomchange", scheduleRenderFromAmap);
  baseMap.on("moveend", handleMapMoveEnd);
  baseMap.on("zoomend", handleMapZoomEnd);
  render();
}

function toLngLat(point) { return [point.lng, point.lat]; }

function pointToScreen(point) {
  if (!baseMap) return { x: -9999, y: -9999 };
  const pixel = baseMap.lngLatToContainer(toLngLat(point));
  return {
    x: typeof pixel.getX === "function" ? pixel.getX() : pixel.x,
    y: typeof pixel.getY === "function" ? pixel.getY() : pixel.y,
  };
}

function scheduleRenderFromAmap() {
  if (renderFrame) return;
  renderFrame = window.requestAnimationFrame(() => {
    renderFrame = null;
    syncMapStateFromAmap();
    render();
  });
}

function syncMapStateFromAmap() {
  if (!baseMap) return;
  const center = baseMap.getCenter();
  const lat = typeof center.getLat === "function" ? center.getLat() : center.lat;
  const lng = typeof center.getLng === "function" ? center.getLng() : center.lng;
  mapState.center = { lat, lng };
  mapState.zoom = Math.round(baseMap.getZoom());
}

function applyMapView() {
  if (!baseMap) return;
  baseMap.setZoomAndCenter(mapState.zoom, toLngLat(mapState.center), false, 180);
}

function render() { renderOverlay(); updatePanel(); }

function renderOverlay() {
  if (!baseMap) return;
  const fragment = document.createDocumentFragment();
  const protectedRects = protectedOverlayRects();
  const maxHotels = maxVisibleHotelCount();
  fragment.append(createPolygon(scenicPoi.fence, "scenic-fence-map"));
  if (mapState.state !== "S3") regions.forEach((region) => fragment.append(createPolygon(region.polygon, "region-fence")));
  fragment.append(createScenicPin());
  fragment.append(createLabel(scenicPoi.name, { lat: scenicPoi.center.lat - 0.002, lng: scenicPoi.center.lng }, "poi-label"));
  gates.forEach((gate) => fragment.append(createLabel(gate.name, gate.point, "gate-label")));
  selectDistributedHotels(visibleHotels(), maxHotels, protectedRects).forEach((hotel) => fragment.append(createHotelBubble(hotel)));
  visibleRegionCards().forEach((region) => {
    if (mapState.state !== "S2") fragment.append(createRegionCard(region));
  });
  overlay.replaceChildren(fragment);
}

function createPolygon(points, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  svg.classList.add("map-svg-layer");
  path.setAttribute("d", pointsToPath(points));
  path.setAttribute("class", className);
  svg.append(path);
  return svg;
}

function pointsToPath(points) {
  return points.map((point, index) => {
    const screen = pointToScreen(point);
    return `${index === 0 ? "M" : "L"}${screen.x.toFixed(1)} ${screen.y.toFixed(1)}`;
  }).join(" ").concat(" Z");
}

function createHotelBubble(hotel) {
  const bubble = document.createElement("span");
  const screen = pointToScreen(hotel.point);
  bubble.className = "hotel-bubble";
  bubble.style.left = `${screen.x}px`;
  bubble.style.top = `${screen.y}px`;
  bubble.innerHTML = `<span class="score">${hotel.score}</span><span class="price">¥${hotel.price}</span>`;
  return bubble;
}

function createRegionCard(region) {
  const card = document.createElement("button");
  const screen = pointToScreen(region.center);
  card.className = "region-card";
  card.type = "button";
  card.style.left = `${screen.x}px`;
  card.style.top = `${screen.y}px`;
  card.innerHTML = `<span class="name">${region.name}</span><span class="choice">${region.choice}</span><strong class="start-price">¥${region.price}<small>起</small></strong>`;
  card.addEventListener("click", () => focusRegion(region.id));
  return card;
}

function createScenicPin() {
  const pin = document.createElement("span");
  const screen = pointToScreen(scenicPoi.center);
  pin.className = "scenic-pin";
  pin.style.left = `${screen.x}px`;
  pin.style.top = `${screen.y}px`;
  pin.innerHTML = `<svg viewBox="0 0 62 72" aria-hidden="true"><path class="pin-shell" d="M31 3C17.2 3 6 14.2 6 28c0 18.5 25 39 25 39s25-20.5 25-39C56 14.2 44.8 3 31 3Z" /><path class="pin-arrow" d="M26 16h10v22h10L31 54 16 38h10V16Z" /></svg>`;
  return pin;
}

function createLabel(text, point, className) {
  const label = document.createElement("span");
  const screen = pointToScreen(point);
  label.className = className;
  label.style.left = `${screen.x}px`;
  label.style.top = `${screen.y}px`;
  label.textContent = text;
  return label;
}

function protectedOverlayRects() {
  if (mapState.state === "S3") return [];
  const rects = [];
  if (mapState.state !== "S2") visibleRegionCards().forEach((region) => {
    const screen = pointToScreen(region.center);
    rects.push({ left: screen.x - 56, right: screen.x + 56, top: screen.y - 42, bottom: screen.y + 45 });
  });
  return rects;
}

function selectDistributedHotels(hotelList, maxCount, protectedRects) {
  const candidates = hotelList.map((hotel, index) => ({ hotel, index, rect: hotelBubbleRect(hotel) }))
    .filter((item) => !isOffscreen(item.rect) && !collidesWithAny(paddedRect(item.rect), protectedRects.map((rect) => paddedRect(rect))));
  const accepted = [];
  const acceptedRects = [];
  const used = new Set();
  const bounds = { left: 0, right: mapElement.clientWidth, top: 150, bottom: mapElement.clientHeight - 22 };
  const columns = mapState.state === "S2" ? 3 : 4;
  const rows = mapState.state === "S2" ? 6 : 7;
  const cellWidth = (bounds.right - bounds.left) / columns;
  const cellHeight = (bounds.bottom - bounds.top) / rows;
  const buckets = Array.from({ length: columns * rows }, () => []);
  seedRegionHotels(candidates, accepted, acceptedRects, used, protectedRects, maxCount);
  candidates.forEach((item) => {
    if (used.has(item.index)) return;
    const center = rectCenter(item.rect);
    const column = clamp(Math.floor((center.x - bounds.left) / cellWidth), 0, columns - 1);
    const row = clamp(Math.floor((center.y - bounds.top) / cellHeight), 0, rows - 1);
    const cellCenter = { x: bounds.left + column * cellWidth + cellWidth / 2, y: bounds.top + row * cellHeight + cellHeight / 2 };
    const priority = mapState.state === "S2" && item.hotel.region === mapState.selectedRegion ? -800 : 0;
    item.spreadScore = priority + distance(center, cellCenter) + item.index * 0.08;
    buckets[row * columns + column].push(item);
  });
  buckets.forEach((bucket) => bucket.sort((a, b) => a.spreadScore - b.spreadScore));
  buckets.forEach((bucket) => {
    const item = bucket.find((candidate) => canAcceptHotel(candidate, acceptedRects, protectedRects));
    if (!item || accepted.length >= maxCount) return;
    acceptHotel(item, accepted, acceptedRects, used);
  });
  const remaining = candidates.filter((item) => !used.has(item.index))
    .sort((a, b) => hotelSpacingScore(b, acceptedRects) - hotelSpacingScore(a, acceptedRects));
  remaining.forEach((item) => {
    if (accepted.length >= maxCount || !canAcceptHotel(item, acceptedRects, protectedRects)) return;
    acceptHotel(item, accepted, acceptedRects, used);
  });
  return accepted.map((item) => item.hotel);
}

function canAcceptHotel(item, acceptedRects, protectedRects) {
  const rect = paddedRect(item.rect);
  return !collidesWithAny(rect, acceptedRects) && !collidesWithAny(rect, protectedRects.map((protectedRect) => paddedRect(protectedRect)));
}

function seedRegionHotels(candidates, accepted, acceptedRects, used, protectedRects, maxCount) {
  if (mapState.state !== "S2" && mapState.state !== "S2M") return;
  const perRegionLimit = mapState.state === "S2" ? 4 : 3;
  regions.forEach((region) => {
    const regionCenter = pointToScreen(region.center);
    const seededCount = accepted.filter((item) => item.hotel.region === region.id).length;
    if (seededCount >= perRegionLimit || accepted.length >= maxCount) return;
    candidates.filter((item) => !used.has(item.index) && item.hotel.region === region.id)
      .sort((a, b) => distance(rectCenter(a.rect), regionCenter) - distance(rectCenter(b.rect), regionCenter))
      .slice(0, perRegionLimit * 3).forEach((item) => {
        const currentRegionCount = accepted.filter((acceptedItem) => acceptedItem.hotel.region === region.id).length;
        if (currentRegionCount >= perRegionLimit || accepted.length >= maxCount) return;
        if (!canAcceptHotel(item, acceptedRects, protectedRects)) return;
        acceptHotel(item, accepted, acceptedRects, used);
      });
  });
}

function acceptHotel(item, accepted, acceptedRects, used) {
  accepted.push(item); acceptedRects.push(paddedRect(item.rect)); used.add(item.index);
}
function hotelSpacingScore(item, acceptedRects) {
  if (!acceptedRects.length) return 0;
  const center = rectCenter(item.rect);
  return Math.min(...acceptedRects.map((rect) => distance(center, rectCenter(rect))));
}
function hotelBubbleRect(hotel) {
  const screen = pointToScreen(hotel.point);
  const width = hotel.price >= 1000 ? 76 : 68;
  return { left: screen.x - width / 2, right: screen.x + width / 2, top: screen.y - 16, bottom: screen.y + 18 };
}
function rectCenter(rect) { return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 }; }
function paddedRect(rect, pad = 5) { return { left: rect.left - pad, right: rect.right + pad, top: rect.top - pad, bottom: rect.bottom + pad }; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function isOffscreen(rect) {
  return rect.right < -24 || rect.left > mapElement.clientWidth + 24 || rect.bottom < 150 || rect.top > mapElement.clientHeight - 22;
}
function collidesWithAny(rect, others) { return others.some((other) => rectsIntersect(rect, other)); }
function rectsIntersect(a, b) { return !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top); }

function visibleHotels() {
  if (mapState.state !== "S2") return hotels;
  return [
    ...hotels.filter((hotel) => hotel.region === mapState.selectedRegion),
    ...hotels.filter((hotel) => hotel.region && hotel.region !== mapState.selectedRegion),
    ...hotels.filter((hotel) => !hotel.region),
  ];
}
function maxVisibleHotelCount() {
  if (mapState.state === "S2") return 28;
  if (mapState.state === "S2M") return 46;
  return 44;
}
function visibleRegionCards() {
  if (mapState.state === "S3") return [];
  if (mapState.state === "S2" && mapState.selectedRegion) return regions.filter((region) => region.id === mapState.selectedRegion);
  return regions;
}

function updatePanel() {
  viewport.dataset.state = mapState.state;
  stateLabel.textContent = stateNames[mapState.state];
  ratioLabel.textContent = `高德地图缩放级别 ${mapState.zoom}`;
  zoomLabel.textContent = `${mapState.zoom}级`;
  scaleLabel.textContent = mapState.zoom >= 15 ? "500米" : mapState.zoom >= 14 ? "1公里" : "2公里";
}

function setState(nextState) {
  mapState.state = nextState;
  mapState.selectedRegion = nextState === "S2" ? "chengpin" : null;
  if (nextState === "S1") { mapState.center = { lat: 31.3112, lng: 120.708 }; mapState.zoom = 13; }
  if (nextState === "S2M") { mapState.center = { lat: 31.313, lng: 120.716 }; mapState.zoom = 14; }
  if (nextState === "S2") { focusRegion("chengpin", false); return; }
  if (nextState === "S3") { mapState.center = { lat: 31.308, lng: 120.708 }; mapState.zoom = 12; }
  lastSettledZoom = mapState.zoom;
  applyMapView(); render();
}

function focusRegion(regionId, updateState = true) {
  const region = regions.find((item) => item.id === regionId);
  if (!region) return;
  if (updateState) mapState.state = "S2";
  mapState.selectedRegion = region.id;
  mapState.center = region.center;
  mapState.zoom = 14;
  lastSettledZoom = mapState.zoom;
  applyMapView(); render();
}

function zoomBy(delta) {
  const oldZoom = mapState.zoom;
  mapState.zoom = Math.max(12, Math.min(17, mapState.zoom + delta));
  lastSettledZoom = mapState.zoom;
  applyMapView(); render();
  window.clearTimeout(zoomTimer);
  zoomTimer = window.setTimeout(() => evaluateZoom(mapState.zoom - oldZoom), 300);
}

function evaluateZoom(delta) {
  if (delta > 0 && mapState.state === "S3" && mapState.zoom >= 13) {
    mapState.state = "S1"; mapState.selectedRegion = null;
    if (mapState.zoom >= 14) { focusRegion(nearestRegionToCenter().id); return; }
  }
  if (delta > 0 && mapState.state === "S1" && mapState.zoom >= 14) { focusRegion(nearestRegionToCenter().id); return; }
  if (delta > 0 && mapState.state === "S2M" && mapState.zoom >= 15) { focusRegion(nearestRegionToCenter().id); return; }
  if (delta < 0 && (mapState.state === "S2" || mapState.state === "S2M") && mapState.zoom < 14) {
    mapState.state = "S1"; mapState.selectedRegion = null;
  }
  if (delta < 0 && mapState.zoom <= 12) { mapState.state = "S3"; mapState.selectedRegion = null; }
  applyMapView(); render();
}

function nearestRegionToCenter() {
  return regions.reduce((nearest, region) => {
    const currentDistance = (region.center.lat - mapState.center.lat) ** 2 + (region.center.lng - mapState.center.lng) ** 2;
    return !nearest || currentDistance < nearest.distance ? { ...region, distance: currentDistance } : nearest;
  }, null);
}

function handleMapMoveEnd() { syncMapStateFromAmap(); render(); }
function handleMapZoomEnd() {
  const oldZoom = lastSettledZoom;
  syncMapStateFromAmap();
  lastSettledZoom = mapState.zoom;
  evaluateZoom(mapState.zoom - oldZoom);
}

function bindEvents() {
  document.querySelectorAll("[data-demo-state]").forEach((button) => button.addEventListener("click", () => setState(button.dataset.demoState)));
  document.querySelector("[data-zoom-in]").addEventListener("click", () => zoomBy(1));
  document.querySelector("[data-zoom-out]").addEventListener("click", () => zoomBy(-1));
  document.querySelector("[data-map-zoom-in]").addEventListener("click", () => zoomBy(1));
  document.querySelector("[data-map-zoom-out]").addEventListener("click", () => zoomBy(-1));
  document.querySelector("[data-reset-view]").addEventListener("click", () => setState("S1"));
  window.addEventListener("resize", render);
}

function showMapError(message) {
  const error = document.createElement("div");
  error.className = "map-error";
  error.textContent = message;
  mapElement.replaceChildren(error);
  updatePanel();
}

bindEvents();
loadAmap();
