(() => {
  const selectBubbles = selectDistributedHotels;

  function createDensityDot(hotel) {
    const dot = document.createElement("span");
    const screen = pointToScreen(hotel.point);
    dot.className = "hotel-dot";
    dot.style.left = `${screen.x}px`;
    dot.style.top = `${screen.y}px`;
    return dot;
  }

  function selectDensityDots(hotelList, bubbles, protectedRects) {
    const bubbleHotels = new Set(bubbles);
    const acceptedDotRects = [];
    const maxDots = mapState.state === "S2" ? 96 : 120;
    const dots = [];

    hotelList.forEach((hotel) => {
      if (bubbleHotels.has(hotel) || dots.length >= maxDots) return;
      const bubbleRect = hotelBubbleRect(hotel);
      if (isOffscreen(bubbleRect)) return;
      const center = rectCenter(bubbleRect);
      const dotRect = {
        left: center.x - 3,
        right: center.x + 3,
        top: center.y - 3,
        bottom: center.y + 3,
      };
      if (collidesWithAny(paddedRect(dotRect, 2), protectedRects)) return;
      if (collidesWithAny(paddedRect(dotRect, 1), acceptedDotRects)) return;
      dots.push(hotel);
      acceptedDotRects.push(paddedRect(dotRect, 1));
    });

    return dots;
  }

  selectDistributedHotels = function selectHotelsWithDots(hotelList, maxCount, protectedRects) {
    const bubbles = selectBubbles(hotelList, maxCount, protectedRects);
    return {
      bubbles,
      dots: selectDensityDots(hotelList, bubbles, protectedRects),
    };
  };

  renderOverlay = function renderOverlayWithDots() {
    if (!baseMap) return;
    const fragment = document.createDocumentFragment();
    const protectedRects = protectedOverlayRects();
    const maxHotels = maxVisibleHotelCount();
    fragment.append(createPolygon(scenicPoi.fence, "scenic-fence-map"));
    if (mapState.state !== "S3") {
      regions.forEach((region) => fragment.append(createPolygon(region.polygon, "region-fence")));
    }
    fragment.append(createScenicPin());
    fragment.append(createLabel(scenicPoi.name, { lat: scenicPoi.center.lat - 0.002, lng: scenicPoi.center.lng }, "poi-label"));
    gates.forEach((gate) => fragment.append(createLabel(gate.name, gate.point, "gate-label")));

    const hotelDisplay = selectDistributedHotels(visibleHotels(), maxHotels, protectedRects);
    hotelDisplay.dots.forEach((hotel) => fragment.append(createDensityDot(hotel)));
    hotelDisplay.bubbles.forEach((hotel) => fragment.append(createHotelBubble(hotel)));

    visibleRegionCards().forEach((region) => {
      if (mapState.state !== "S2") fragment.append(createRegionCard(region));
    });
    overlay.replaceChildren(fragment);
  };

  const style = document.createElement("style");
  style.textContent = ".hotel-dot{position:absolute;z-index:5;width:5px;height:5px;border:1px solid rgba(255,255,255,.94);border-radius:50%;background:#6975f5;box-shadow:0 1px 3px rgba(63,74,178,.34);opacity:.72;transform:translate(-50%,-50%);pointer-events:none}";
  document.head.append(style);
})();
