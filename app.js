(() => {
  'use strict';

  const GITHUB_SYNC = {
    owner: 'Gen7920335', repo: 'wtfmi-alignment-data', branch: 'main', path: 'alignment-state.json',
    apiVersion: '2026-03-10'
  };
  const TOKEN_VAULT = {
    schema: 'wtfmi-encrypted-github-token-v2',
    passwordLength: 10, randomKeyLength: 47, pbkdf2Iterations: 600000
  };
  let unlockedGithubToken = '';
  let hostedTokenVault = null;
  let hostedTokenVaultError = '';

  const MAPS = {
    customs: {
      label: 'Customs / 세관', source: './assets/source-maps/customs.webp',
      floors: [floor('main', '1층 / Main', 'customs', [1]), floor('level2', '2층', 'customs', [2]), floor('level3', '3층', 'customs', [3])]
    },
    factory: {
      label: 'Factory / 공장', source: './assets/source-maps/factory.png',
      floors: [floor('basement', '지하', 'factory', [0]), floor('main', '1층 / Main', 'factory', [1]), floor('level2', '2층', 'factory', [2]), floor('level3', '3층', 'factory', [3])]
    },
    'ground-zero': {
      label: 'Ground Zero / 그라운드 제로', source: './assets/source-maps/ground_zero.webp',
      floors: [floor('basement', '지하', 'ground-zero', [0]), floor('main', '1층 / Main', 'ground-zero', [1]), floor('level2', '2층', 'ground-zero', [2])]
    },
    interchange: {
      label: 'Interchange / 인터체인지', source: './assets/source-maps/interchange.webp',
      floors: [
        floor('main', 'Parking / B1(지상층)', 'interchange', [1], [
          region('interchange-surface', '지상·파킹 본도', [0, 500, 5200, 5400], [999, 1100, 3000, 2872]),
          region('interchange-power-station-interior', '발전소 확대도', [8550, 3500, 9600, 4100], [1180, 2000, 1460, 2380])
        ]),
        floor('level2', '1층', 'interchange', [2], [
          region('interchange-first-floor', '1층 패널', [7000, 1100, 8450, 4200], [1940, 1320, 2610, 2450])
        ]),
        floor('level3', '2층', 'interchange', [3], [
          region('interchange-second-floor', '2층 패널', [8550, 1900, 9600, 3500], [1940, 1320, 2610, 2450])
        ])
      ]
    },
    icebreaker: {
      label: 'Icebreaker / 쇄빙선', source: './assets/source-maps/icebreaker.webp',
      floors: [
        floor('lower_automation', 'Deck -3 · Lower automation', 'icebreaker', [-3]), floor('engine_room', 'Deck -2 · Engine room', 'icebreaker', [-2]),
        floor('fuel_pumps', 'Deck -1 · Fuel pumps', 'icebreaker', [-1]), floor('storage_security', 'Deck 0 · Storage/security', 'icebreaker', [0]),
        floor('main_infirmary', 'Deck 1 · Main/infirmary', 'icebreaker', [1]), floor('helipad', 'Deck 2 · Helipad', 'icebreaker', [2]),
        floor('gym_canteen', 'Deck 3 · Gym/canteen', 'icebreaker', [3]), floor('accomodation_4', 'Deck 4 · Accommodation', 'icebreaker', [4]),
        floor('accomodation_5', 'Deck 5 · Accommodation', 'icebreaker', [5]), floor('accomodation_6', 'Deck 6 · Accommodation', 'icebreaker', [6]),
        floor('officers_deck', 'Deck 7 · Officers', 'icebreaker', [7]), floor('stairs_blocked', 'Deck 8 · Blocked stairs', 'icebreaker', [8]),
        floor('bridge', 'Deck 9 · Bridge', 'icebreaker', [9]), floor('bridge_roof', 'Deck 10 · Bridge roof', 'icebreaker', [10])
      ]
    },
    lab: {
      label: 'The Lab / 연구실', source: './assets/source-maps/lab.webp',
      floors: [
        floor('basement', '지하 / Technical', 'lab', [0], [
          region('lab-technical-source-panel', 'Technical 패널', [0, 0, 1000, 1450], [1516, 1200, 3924, 3132])
        ]),
        floor('main', '1층 / Main', 'lab', [1], [
          region('lab-main-source-panel', 'First Level 패널', [1120, 844, 2580, 2080], [1516, 1200, 3924, 3132])
        ]),
        floor('level2', '2층', 'lab', [2], [
          region('lab-level2-source-panel', 'Second Level 패널', [2456, 32, 3724, 1108], [1516, 1200, 3924, 3132])
        ])
      ]
    },
    labyrinth: {
      label: 'The Labyrinth / 미궁', source: './assets/source-maps/labyrinth.webp',
      floors: [floor('main', 'Main', 'labyrinth', '*')]
    },
    lighthouse: {
      label: 'Lighthouse / 등대', source: './assets/source-maps/lighthouse.png',
      floors: [
        floor('main', '1층 / Main', 'lighthouse', [1], [
          region('lighthouse-main-map', '본도 / 미분류', [0, 0, 2242, 3892], null, { excludeCustom: true })
        ], './assets/wtfmi-maps/lighthouse.png'),
        floor('level2', '2층', 'lighthouse', [2], [
          region('lighthouse-level2-empty', '2층 사각형 미지정', null, null, { placeholder: true })
        ], './assets/wtfmi-maps/lighthouse.png'),
        floor('level3', '3층', 'lighthouse', [3], [
          region('lighthouse-level3-empty', '3층 사각형 미지정', null, null, { placeholder: true })
        ], './assets/wtfmi-maps/lighthouse.png')
      ]
    },
    reserve: {
      label: 'Reserve / 리저브', source: './assets/source-maps/reserve.webp',
      floors: [floor('bunker', '지하 벙커', 'reserve', [0]), floor('main', '1층 / Main', 'reserve', [1]), floor('level2', '2층', 'reserve', [2]), floor('level3', '3층', 'reserve', [3]), floor('level4', '4층', 'reserve', [4]), floor('level5', '5층', 'reserve', [5])]
    },
    shoreline: {
      label: 'Shoreline / 해안선', source: './assets/source-maps/shoreline.webp',
      floors: [floor('main', '1층 / Main', 'shoreline', [1]), floor('level2', '2층', 'shoreline', [2]), floor('level3', '3층', 'shoreline', [3])]
    },
    streets: {
      label: 'Streets of Tarkov / 스오타', source: './assets/source-maps/streets_of_tarkov.webp',
      floors: [floor('main', '1층 / Main', 'streets', [1]), floor('level2', '2층', 'streets', [2])]
    },
    woods: {
      label: 'Woods / 삼림', source: './assets/source-maps/woods.webp',
      floors: [floor('basement', '지하', 'woods', [0]), floor('main', '1층 / Main', 'woods', [1]), floor('level2', '2층', 'woods', [2])]
    }
  };

  function floor(id, label, map, markerFloors, regions = null, target = null) {
    return { id, label, markerFloors, regions, target: target || `./assets/wtfmi-maps/floors/${map}/${id}.png` };
  }

  function region(id, label, sourceBounds, targetBounds, options = {}) {
    return { id, label, sourceBounds, targetBounds, ...options };
  }

  const $ = id => document.getElementById(id);
  const MIN_CONTROL_POINTS = 3;
  const MIN_VALIDATION_POINTS = 3;
  const state = {
    map: 'customs', floor: 'main', region: null, pointMode: 'control', model: 'piecewise', opacity: 0.5,
    points: [], pendingSource: null, nextId: 1, history: [], projectStore: loadStoredProjects(), customRegions: loadStoredCustomRegions(),
    showTriangles: true, showMarkers: true, allowGlobalFallback: false,
    sourceImage: null, targetImage: null, battlePassData: null, spaceDown: false, regionDrawMode: false, regionDraft: null
  };

  const sourceViewer = new Viewer($('sourceCanvas'), 'source');
  const targetViewer = new Viewer($('targetCanvas'), 'target');
  const overlayViewer = new Viewer($('overlayCanvas'), 'overlay');

  initialize().catch(error => {
    console.error(error);
    toast(`초기화 실패: ${error.message}`, true);
  });

  async function initialize() {
    for (const [key, config] of Object.entries(MAPS)) $('mapSelect').add(new Option(config.label, key));
    bindUi();
    await loadHostedTokenVault();
    updateTokenVaultUi();
    try {
      const response = await fetch('./data/battle-pass-locations.json', { cache: 'no-store' });
      state.battlePassData = response.ok ? await response.json() : null;
    } catch (error) {
      console.warn('Battle Pass marker preview unavailable', error);
    }
    await switchMap('customs');
  }

  function bindUi() {
    $('mapSelect').addEventListener('change', event => switchMap(event.target.value));
    $('floorSelect').addEventListener('change', event => switchFloor(event.target.value));
    $('regionSelect').addEventListener('change', event => switchRegion(event.target.value));
    $('githubLoadButton').addEventListener('click', loadStateFromGithub);
    $('githubSaveButton').addEventListener('click', saveStateToGithub);
    $('githubUnlockButton').addEventListener('click', unlockGithubToken);
    $('githubPasswordInput').addEventListener('keydown', event => { if (event.key === 'Enter') unlockGithubToken(); });
    $('githubLockButton').addEventListener('click', lockGithubToken);
    $('addRegionButton').addEventListener('click', toggleRegionDrawMode);
    $('regionNameInput').addEventListener('change', renameCurrentRegion);
    $('regionFloorSelect').addEventListener('change', event => changeCurrentRegionFloor(event.target.value));
    $('deleteRegionButton').addEventListener('click', deleteCurrentRegion);
    $('modelSelect').addEventListener('change', event => { state.model = event.target.value; renderAll(); persistCurrent(); });
    $('controlMode').addEventListener('click', () => setPointMode('control'));
    $('validationMode').addEventListener('click', () => setPointMode('validation'));
    $('opacityRange').addEventListener('input', event => {
      state.opacity = Number(event.target.value) / 100;
      $('opacityOutput').value = `${event.target.value}%`;
      overlayViewer.draw();
      persistCurrent();
    });
    $('fitAllButton').addEventListener('click', fitAll);
    $('fitRegionButton').addEventListener('click', fitCurrentRegion);
    $('undoButton').addEventListener('click', undo);
    $('clearButton').addEventListener('click', clearPoints);
    $('showTriangles').addEventListener('change', event => { state.showTriangles = event.target.checked; renderAll(); persistCurrent(); });
    $('showMarkers').addEventListener('change', event => { state.showMarkers = event.target.checked; renderAll(); persistCurrent(); });
    $('allowGlobalFallback').addEventListener('change', event => { state.allowGlobalFallback = event.target.checked; renderAll(); persistCurrent(); });
    $('saveProjectButton').addEventListener('click', saveProject);
    $('loadProjectInput').addEventListener('change', loadProject);
    $('exportCandidatesButton').addEventListener('click', exportCandidates);
    window.addEventListener('keydown', event => {
      if (event.code === 'Space' && !isFormElement(event.target)) { state.spaceDown = true; event.preventDefault(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); }
      if (event.key === 'Escape') { state.pendingSource = null; state.regionDrawMode = false; state.regionDraft = null; renderAll(); updateUi(); }
    });
    window.addEventListener('keyup', event => { if (event.code === 'Space') state.spaceDown = false; });
  }

  function isFormElement(element) {
    return ['INPUT', 'SELECT', 'TEXTAREA'].includes(element?.tagName);
  }

  async function switchMap(map) {
    saveCurrentToStore();
    state.regionDrawMode = false; state.regionDraft = null;
    state.map = map;
    $('mapSelect').value = map;
    $('floorSelect').innerHTML = '';
    for (const item of MAPS[map].floors) $('floorSelect').add(new Option(item.label, item.id));
    state.floor = MAPS[map].floors[0].id;
    state.region = null;
    await loadSelection();
  }

  async function switchFloor(floorId) {
    saveCurrentToStore();
    state.regionDrawMode = false; state.regionDraft = null;
    state.floor = floorId;
    state.region = null;
    await loadSelection();
  }

  async function switchRegion(regionId) {
    saveCurrentToStore();
    state.regionDrawMode = false; state.regionDraft = null;
    const selected = regionDefinitions().find(item => item.id === regionId);
    if (selected?.floorId && selected.floorId !== state.floor) {
      state.floor = selected.floorId;
      $('floorSelect').value = state.floor;
    }
    state.region = regionId;
    await loadSelection();
  }

  async function loadSelection() {
    $('floorSelect').value = state.floor;
    populateRegionSelect();
    state.pendingSource = null;
    const firstRegion = defaultRegionForFloor()?.id;
    const saved = state.projectStore[selectionKey()] || (state.region === firstRegion ? state.projectStore[legacySelectionKey()] : null);
    state.points = saved?.points ? structuredClone(saved.points) : [];
    state.nextId = Math.max(0, ...state.points.map(point => point.id || 0)) + 1;
    state.model = saved?.model || 'piecewise';
    state.opacity = saved?.opacity ?? 0.5;
    state.showTriangles = saved?.showTriangles ?? true;
    state.showMarkers = saved?.showMarkers ?? true;
    state.allowGlobalFallback = saved?.allowGlobalFallback ?? false;
    state.history = [];
    syncControls();
    $('sourceBadge').textContent = '이미지 로딩';
    $('targetBadge').textContent = '이미지 로딩';
    const floorConfig = currentFloor();
    const [sourceImage, targetImage] = await Promise.all([loadImage(MAPS[state.map].source), loadImage(floorConfig.target)]);
    state.sourceImage = sourceImage;
    state.targetImage = targetImage;
    sourceViewer.setImage(sourceImage);
    targetViewer.setImage(targetImage);
    overlayViewer.setImage(sourceImage);
    fitCurrentRegion();
    updateUi();
    renderAll();
  }

  function syncControls() {
    $('modelSelect').value = state.model;
    $('opacityRange').value = String(Math.round(state.opacity * 100));
    $('opacityOutput').value = `${Math.round(state.opacity * 100)}%`;
    $('showTriangles').checked = state.showTriangles;
    $('showMarkers').checked = state.showMarkers;
    $('allowGlobalFallback').checked = state.allowGlobalFallback;
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`이미지를 불러올 수 없음: ${url}`));
      image.src = `${url}?v=${Date.now()}`;
    });
  }

  function currentFloor() {
    return MAPS[state.map].floors.find(item => item.id === state.floor);
  }

  function floorMarkers() {
    const markers = (state.battlePassData?.maps?.[state.map] || []).filter(marker => marker.excluded !== true);
    const custom = customRegionDefinitions();
    const withoutCustomOwner = marker => !custom.some(item => insideRegion(markerSourcePixel(marker), item));
    const customFloorMarkers = markers.filter(marker => custom.some(item => item.floorId === state.floor && insideRegion(markerSourcePixel(marker), item)));
    let regularFloorMarkers;
    if (state.map === 'lighthouse') {
      regularFloorMarkers = state.floor === 'main' ? markers.filter(withoutCustomOwner) : [];
    } else {
      const regions = currentFloor().regions;
      if (regions?.length) {
        regularFloorMarkers = markers.filter(marker => regions.some(item => insideBounds(markerSourcePixel(marker), item.sourceBounds)) && withoutCustomOwner(marker));
      } else {
        const floors = currentFloor().markerFloors;
        regularFloorMarkers = markers.filter(marker => (floors === '*' || floors.includes(Number(marker.floor))) && withoutCustomOwner(marker));
      }
    }
    return [...regularFloorMarkers, ...customFloorMarkers];
  }

  function regionDefinitions() {
    const fixedRegions = MAPS[state.map].floors.flatMap(floorConfig =>
      (floorConfig.regions || []).map(item => ({ ...item, floorId: floorConfig.id, floorLabel: floorConfig.label }))
    );
    const customRegions = customRegionDefinitions();
    if (fixedRegions.length || customRegions.length) {
      const mapMarkers = (state.battlePassData?.maps?.[state.map] || []).filter(marker => marker.excluded !== true);
      return [...fixedRegions, ...customRegions].map(item => {
        let ownedMarkers = [];
        if (!item.placeholder) {
          ownedMarkers = mapMarkers.filter(marker => {
            const source = markerSourcePixel(marker);
            if (item.custom) return insideRegion(source, item);
            if (!insideBounds(source, item.sourceBounds)) return false;
            return !item.excludeCustom || !customRegions.some(custom => insideRegion(source, custom));
          });
        }
        return { ...item, markerCount: ownedMarkers.length, ownership: item.placeholder ? 'placeholder' : 'source-panel-containment' };
      });
    }
    const grouped = new Map();
    for (const marker of floorMarkers()) {
      const calibration = marker.coordinateValidation?.calibration;
      const id = calibration?.id || 'all';
      if (!grouped.has(id)) grouped.set(id, { id, label: id === 'all' ? '전체/기본 구역' : id, markerCount: 0, sourceBounds: calibration?.sourceBounds || null, targetBounds: calibration?.targetBounds || null });
      grouped.get(id).markerCount += 1;
    }
    if (!grouped.size) grouped.set('all', { id: 'all', label: '전체/기본 구역', markerCount: 0, sourceBounds: null, targetBounds: null });
    return [...grouped.values()].sort((left, right) => right.markerCount - left.markerCount || left.label.localeCompare(right.label));
  }

  function populateRegionSelect() {
    const regions = regionDefinitions();
    if (!regions.some(item => item.id === state.region)) {
      state.region = regions.find(item => !item.floorId || item.floorId === state.floor)?.id || regions[0].id;
    }
    $('regionSelect').innerHTML = '';
    for (const item of regions) {
      const floorPrefix = item.floorLabel ? `${item.floorLabel} · ` : '';
      const numberPrefix = item.custom ? `#${item.displayIndex} · ` : '';
      $('regionSelect').add(new Option(`${floorPrefix}${numberPrefix}${item.label} (${item.markerCount})`, item.id));
    }
    $('regionSelect').value = state.region;
  }

  function currentRegion() { return regionDefinitions().find(item => item.id === state.region) || regionDefinitions()[0]; }
  function defaultRegionForFloor() {
    const regions = regionDefinitions();
    return regions.find(item => !item.floorId || item.floorId === state.floor) || regions[0];
  }
  function selectionKey() { return `${state.map}:${state.floor}:${state.region}`; }
  function legacySelectionKey() { return `${state.map}:${state.floor}`; }

  function customRegionDefinitions() {
    return (state.customRegions[state.map] || []).map((item, index) => {
      const geometry = item.geometry || geometryFromBounds(item.sourceBounds);
      return {
        ...item, geometry, sourceBounds: rotatedBounds(geometry), displayIndex: item.displayIndex || index + 1,
        colorIndex: item.colorIndex ?? index, custom: true,
        floorLabel: MAPS[state.map].floors.find(floorItem => floorItem.id === item.floorId)?.label || item.floorId
      };
    });
  }

  function toggleRegionDrawMode() {
    state.regionDrawMode = !state.regionDrawMode;
    state.regionDraft = null;
    state.pendingSource = null;
    updateUi(); renderAll();
    if (state.regionDrawMode) toast('왼쪽 원본 지도에서 사용자 지정 구역을 드래그하세요.');
  }

  function finishCustomRegion(start, end) {
    const bounds = normalizeBounds(start, end).map((value, index) => Math.max(0, Math.min(index % 2 ? state.sourceImage.naturalHeight : state.sourceImage.naturalWidth, value)));
    if (bounds[2] - bounds[0] < 8 || bounds[3] - bounds[1] < 8) {
      toast('사각형이 너무 작습니다.', true); return;
    }
    const geometry = geometryFromBounds(bounds);
    const overlaps = customRegionDefinitions().some(item => rotatedRectanglesOverlap(geometry, item.geometry));
    if (overlaps) { toast('기존 사용자 지정 사각형과 겹칠 수 없습니다. 경계를 다시 지정하세요.', true); return; }
    const list = state.customRegions[state.map] ||= [];
    const id = `${state.map}-region-${Date.now().toString(36)}`;
    const displayIndex = Math.max(0, ...list.map(regionItem => Number(regionItem.displayIndex) || 0)) + 1;
    const usedColors = new Set(list.map(regionItem => Number(regionItem.colorIndex) || 0));
    let colorIndex = 0; while (usedColors.has(colorIndex)) colorIndex += 1;
    const item = { id, label: `사용자 구역 ${displayIndex}`, displayIndex, colorIndex, floorId: state.floor, geometry, sourceBounds: bounds.map(round3), targetBounds: null, createdAt: new Date().toISOString() };
    list.push(item);
    persistCustomRegions();
    state.region = id; state.regionDrawMode = false; state.regionDraft = null;
    loadSelection();
    toast(`${item.label}을 ${currentFloor().label}에 추가했습니다.`);
  }

  function renameCurrentRegion() {
    const item = (state.customRegions[state.map] || []).find(regionItem => regionItem.id === state.region);
    if (!item) return;
    item.label = $('regionNameInput').value.trim() || item.label;
    persistCustomRegions(); populateRegionSelect(); updateUi(); renderAll();
  }

  async function changeCurrentRegionFloor(floorId) {
    const item = (state.customRegions[state.map] || []).find(regionItem => regionItem.id === state.region);
    if (!item || !MAPS[state.map].floors.some(floorItem => floorItem.id === floorId)) return;
    saveCurrentToStore();
    const oldKey = selectionKey();
    const savedProject = state.projectStore[oldKey];
    item.floorId = floorId;
    state.floor = floorId;
    if (savedProject) {
      const newKey = selectionKey();
      state.projectStore[newKey] = { ...savedProject, floor: floorId };
      if (newKey !== oldKey) delete state.projectStore[oldKey];
    }
    persistCustomRegions(); persistCurrent();
    await loadSelection();
    toast(`${item.label}을 ${currentFloor().label}으로 옮겼습니다.`);
  }

  async function deleteCurrentRegion() {
    const list = state.customRegions[state.map] || [];
    const index = list.findIndex(item => item.id === state.region);
    if (index < 0) return;
    const removed = list[index];
    list.splice(index, 1);
    delete state.projectStore[selectionKey()];
    persistCustomRegions();
    state.region = null;
    await loadSelection();
    toast(`${removed.label}을 삭제했습니다. 해당 마커는 본도로 돌아갔습니다.`);
  }

  function normalizeBounds(a, b) { return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  function geometryFromBounds(bounds) {
    return { center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2], width: bounds[2] - bounds[0], height: bounds[3] - bounds[1], angle: 0 };
  }
  function rotatedCorners(geometry) {
    const cos = Math.cos(geometry.angle), sin = Math.sin(geometry.angle), halfWidth = geometry.width / 2, halfHeight = geometry.height / 2;
    return [[-halfWidth, -halfHeight], [halfWidth, -halfHeight], [halfWidth, halfHeight], [-halfWidth, halfHeight]].map(([x, y]) => [
      geometry.center[0] + x * cos - y * sin,
      geometry.center[1] + x * sin + y * cos
    ]);
  }
  function rotatedBounds(geometry) {
    const corners = rotatedCorners(geometry), xs = corners.map(point => point[0]), ys = corners.map(point => point[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  function insideRegion(point, item) {
    if (!item?.custom || !item.geometry) return insideBounds(point, item?.sourceBounds);
    const dx = point[0] - item.geometry.center[0], dy = point[1] - item.geometry.center[1];
    const cos = Math.cos(item.geometry.angle), sin = Math.sin(item.geometry.angle);
    const x = dx * cos + dy * sin, y = -dx * sin + dy * cos;
    return Math.abs(x) <= item.geometry.width / 2 + 1e-6 && Math.abs(y) <= item.geometry.height / 2 + 1e-6;
  }
  function rotatedRectanglesOverlap(left, right) {
    const a = rotatedCorners(left), b = rotatedCorners(right);
    const axes = [...edgeAxes(a), ...edgeAxes(b)];
    return axes.every(axis => {
      const pa = a.map(point => point[0] * axis[0] + point[1] * axis[1]);
      const pb = b.map(point => point[0] * axis[0] + point[1] * axis[1]);
      return Math.min(...pa) < Math.max(...pb) - 1e-6 && Math.min(...pb) < Math.max(...pa) - 1e-6;
    });
  }
  function edgeAxes(corners) {
    return [0, 1].map(index => {
      const edge = [corners[index + 1][0] - corners[index][0], corners[index + 1][1] - corners[index][1]];
      const length = Math.hypot(edge[0], edge[1]) || 1;
      return [-edge[1] / length, edge[0] / length];
    });
  }
  function regionColor(item) { return `hsl(${((Number(item.colorIndex) || 0) * 137.508) % 360} 88% 66%)`; }
  function regionHandlePoints(geometry) {
    const cos = Math.cos(geometry.angle), sin = Math.sin(geometry.angle);
    return {
      center: [...geometry.center],
      width: [geometry.center[0] + cos * geometry.width / 2, geometry.center[1] + sin * geometry.width / 2],
      height: [geometry.center[0] - sin * geometry.height / 2, geometry.center[1] + cos * geometry.height / 2]
    };
  }
  function updateRegionFromHandle(item, handleType, movingPoint, originalGeometry) {
    if (handleType === 'center') {
      item.geometry = { ...originalGeometry, center: [...movingPoint] };
    } else if (handleType === 'width') {
      const dx = movingPoint[0] - originalGeometry.center[0], dy = movingPoint[1] - originalGeometry.center[1];
      const halfWidth = Math.hypot(dx, dy);
      if (halfWidth < 4) return;
      item.geometry = { ...originalGeometry, width: halfWidth * 2, angle: Math.atan2(dy, dx) };
    } else if (handleType === 'height') {
      const dx = movingPoint[0] - originalGeometry.center[0], dy = movingPoint[1] - originalGeometry.center[1];
      const normal = [-Math.sin(originalGeometry.angle), Math.cos(originalGeometry.angle)];
      const halfHeight = Math.abs(dx * normal[0] + dy * normal[1]);
      if (halfHeight < 4) return;
      item.geometry = { ...originalGeometry, height: halfHeight * 2 };
    }
    item.sourceBounds = rotatedBounds(item.geometry).map(round3);
  }

  function invalidRegionGeometry(item) {
    if (rotatedCorners(item.geometry).some(point => !insideImage(point, state.sourceImage))) return '사각형이 원본 지도 밖으로 나갈 수 없습니다.';
    const overlap = customRegionDefinitions().some(other => other.id !== item.id && rotatedRectanglesOverlap(item.geometry, other.geometry));
    return overlap ? '다른 사용자 지정 사각형과 겹칠 수 없습니다.' : null;
  }

  function setPointMode(mode) {
    state.pointMode = mode;
    $('controlMode').classList.toggle('active', mode === 'control');
    $('validationMode').classList.toggle('active', mode === 'validation');
    state.pendingSource = null;
    updateUi();
    renderAll();
  }

  function handlePointClick(side, point) {
    if (side === 'overlay') return;
    if (currentRegion()?.placeholder) {
      toast('이 층에 사용자 지정 사각형을 먼저 추가하세요.', true);
      return;
    }
    const image = side === 'source' ? state.sourceImage : state.targetImage;
    if (!insideImage(point, image)) {
      toast(`${side === 'source' ? '원본' : 'WTFMI'} 이미지 바깥 여백에는 점을 만들 수 없습니다.`, true);
      return;
    }
    const regionBounds = boundsForSide(side);
    if (regionBounds && !insideBounds(point, regionBounds)) {
      toast(`${side === 'source' ? '원본' : 'WTFMI'}의 현재 정합 구역 밖에는 점을 만들 수 없습니다.`, true);
      return;
    }
    if (side === 'source' && currentRegion()?.custom && !insideRegion(point, currentRegion())) {
      toast('회전된 현재 사용자 지정 사각형 밖에는 점을 만들 수 없습니다.', true);
      return;
    }
    if (side === 'source') {
      state.pendingSource = point;
      updateUi();
      renderAll();
      return;
    }
    if (!state.pendingSource) {
      toast('원본 지도에서 같은 지점을 먼저 클릭하세요.', true);
      return;
    }
    snapshot();
    const id = state.nextId++;
    state.points.push({ id, type: state.pointMode, name: `${state.pointMode === 'control' ? '기준점' : '검증점'} ${id}`, enabled: true, source: state.pendingSource, target: point });
    state.pendingSource = null;
    persistCurrent();
    updateUi();
    renderAll();
  }

  function snapshot() {
    state.history.push(JSON.stringify(state.points));
    if (state.history.length > 100) state.history.shift();
  }

  function undo() {
    const previous = state.history.pop();
    if (!previous) return;
    state.points = JSON.parse(previous);
    state.pendingSource = null;
    persistCurrent(); updateUi(); renderAll();
  }

  function clearPoints() {
    if (!state.points.length) return;
    snapshot();
    state.points = [];
    state.pendingSource = null;
    persistCurrent(); updateUi(); renderAll();
  }

  function fitAll() {
    sourceViewer.fit();
    targetViewer.fit();
    overlayViewer.fit();
    renderAll();
  }

  function fitCurrentRegion() {
    const region = currentRegion();
    if (region?.sourceBounds) {
      sourceViewer.fitBounds(region.sourceBounds);
      overlayViewer.fitBounds(region.sourceBounds);
    } else {
      sourceViewer.fit();
      overlayViewer.fit();
    }
    if (region?.targetBounds) targetViewer.fitBounds(region.targetBounds);
    else targetViewer.fit();
    renderAll();
  }

  function renderAll() {
    sourceViewer.draw(); targetViewer.draw(); overlayViewer.draw(); updateUi();
  }

  function drawViewer(viewer) {
    const ctx = viewer.context();
    const { canvas, dpr } = viewer;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if (!state.sourceImage || !state.targetImage) return;
    if (viewer.side === 'source') drawImageNative(ctx, state.sourceImage, viewer.view, dpr);
    else if (viewer.side === 'target') drawImageNative(ctx, state.targetImage, viewer.view, dpr);
    else drawOverlay(ctx, viewer, dpr);
    if (viewer.side === 'source' || viewer.side === 'overlay') drawRegionLayer(ctx, viewer);
    if (viewer.side === 'source') drawSourceMarkers(ctx, viewer);
    if (viewer.side === 'target') drawCandidateMarkers(ctx, viewer);
    drawPointLayer(ctx, viewer);
  }

  function drawImageNative(ctx, image, view, dpr, alpha = 1) {
    ctx.save();
    ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.x, dpr * view.y);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  }

  function drawOverlay(ctx, viewer, dpr) {
    drawImageNative(ctx, state.sourceImage, viewer.view, dpr);
    const model = calculateRegistration();
    if (!model.ready) return;
    if (state.model === 'piecewise' && model.triangles.length) {
      if (state.allowGlobalFallback && model.reverseGlobal) drawGlobalWarp(ctx, viewer, dpr, model.reverseGlobal, state.opacity * 0.38);
      for (const triangle of model.triangles) {
        if (triangle.folded) continue;
        drawTriangleWarp(ctx, viewer, dpr, triangle, state.opacity);
      }
    } else if (model.reverseGlobal) {
      drawGlobalWarp(ctx, viewer, dpr, model.reverseGlobal, state.opacity);
    }
  }

  function drawGlobalWarp(ctx, viewer, dpr, reverse, alpha) {
    ctx.save();
    const bounds = currentRegion()?.sourceBounds;
    if (bounds) {
      const topLeft = viewer.nativeToScreen([bounds[0], bounds[1]]);
      const bottomRight = viewer.nativeToScreen([bounds[2], bounds[3]]);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      ctx.rect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);
      ctx.clip();
    }
    applyNativeAffine(ctx, viewer.view, reverse, dpr);
    ctx.globalAlpha = alpha;
    ctx.drawImage(state.targetImage, 0, 0);
    ctx.restore();
  }

  function drawTriangleWarp(ctx, viewer, dpr, triangle, alpha) {
    const sourceScreen = triangle.source.map(point => viewer.nativeToScreen(point));
    const reverse = exactAffine(triangle.target, triangle.source);
    if (!reverse) return;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.beginPath();
    ctx.moveTo(sourceScreen[0][0], sourceScreen[0][1]);
    ctx.lineTo(sourceScreen[1][0], sourceScreen[1][1]);
    ctx.lineTo(sourceScreen[2][0], sourceScreen[2][1]);
    ctx.closePath();
    ctx.clip();
    applyNativeAffine(ctx, viewer.view, reverse, dpr);
    ctx.globalAlpha = alpha;
    ctx.drawImage(state.targetImage, 0, 0);
    ctx.restore();
  }

  function applyNativeAffine(ctx, view, model, dpr) {
    ctx.setTransform(
      dpr * view.scale * model[0], dpr * view.scale * model[3],
      dpr * view.scale * model[1], dpr * view.scale * model[4],
      dpr * (view.scale * model[2] + view.x), dpr * (view.scale * model[5] + view.y)
    );
  }

  function drawPointLayer(ctx, viewer) {
    const model = calculateRegistration();
    if (state.showTriangles && model.triangles.length) {
      const side = viewer.side === 'target' ? 'target' : 'source';
      ctx.save();
      ctx.lineWidth = 1;
      for (const triangle of model.triangles) {
        const points = triangle[side].map(point => viewer.nativeToScreen(point));
        ctx.strokeStyle = triangle.folded ? '#ff3556' : triangle.condition > 4 ? '#ffb020' : 'rgba(98,230,140,.7)';
        ctx.beginPath(); ctx.moveTo(...points[0]); ctx.lineTo(...points[1]); ctx.lineTo(...points[2]); ctx.closePath(); ctx.stroke();
      }
      ctx.restore();
    }
    const coordinateSide = viewer.side === 'target' ? 'target' : 'source';
    for (const point of state.points) {
      const screen = viewer.nativeToScreen(point[coordinateSide]);
      drawPoint(ctx, screen, point.id, point.type, point.enabled);
    }
    if (viewer.side === 'source' && state.pendingSource) drawPoint(ctx, viewer.nativeToScreen(state.pendingSource), '+', state.pointMode, true, true);
  }

  function drawPoint(ctx, screen, id, type, enabled, pending = false) {
    const color = type === 'validation' ? '#b78cff' : '#00d8ff';
    ctx.save();
    ctx.globalAlpha = enabled ? 1 : 0.3;
    ctx.translate(screen[0], screen[1]);
    ctx.beginPath(); ctx.arc(0, 0, pending ? 10 : 7, 0, Math.PI * 2); ctx.fillStyle = '#071015'; ctx.fill();
    ctx.lineWidth = pending ? 3 : 2; ctx.strokeStyle = color; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.moveTo(0, -11); ctx.lineTo(0, 11); ctx.stroke();
    ctx.font = '700 12px Consolas'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.strokeText(String(id), 11, -9); ctx.fillText(String(id), 11, -9);
    ctx.restore();
  }

  function drawRegionLayer(ctx, viewer) {
    ctx.save();
    ctx.setLineDash([7, 5]);
    for (const item of customRegionDefinitions()) {
      const points = rotatedCorners(item.geometry).map(point => viewer.nativeToScreen(point));
      const color = regionColor(item);
      ctx.beginPath(); ctx.moveTo(...points[0]); for (const point of points.slice(1)) ctx.lineTo(...point); ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = item.id === state.region ? 3 : 1.5;
      ctx.globalAlpha = 0.12; ctx.fillStyle = color; ctx.fill();
      ctx.globalAlpha = 1; ctx.stroke();
      ctx.font = '700 11px "Segoe UI"';
      ctx.fillStyle = color;
      ctx.fillText(`#${item.displayIndex} · ${item.label} · ${item.floorLabel}`, points[0][0] + 4, points[0][1] - 6);
      if (item.id === state.region && viewer.side === 'source') drawRegionHandles(ctx, item.geometry, viewer, color);
    }
    if (state.regionDraft) {
      const bounds = normalizeBounds(state.regionDraft.start, state.regionDraft.end);
      const topLeft = viewer.nativeToScreen([bounds[0], bounds[1]]);
      const bottomRight = viewer.nativeToScreen([bounds[2], bounds[3]]);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.strokeRect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);
    }
    ctx.restore();
  }

  function drawRegionHandles(ctx, geometry, viewer, color) {
    ctx.setLineDash([]);
    const nativeHandles = regionHandlePoints(geometry);
    const handles = [
      { type: 'center', label: '중심', point: viewer.nativeToScreen(nativeHandles.center) },
      { type: 'width', label: '방향·너비', point: viewer.nativeToScreen(nativeHandles.width) },
      { type: 'height', label: '높이', point: viewer.nativeToScreen(nativeHandles.height) }
    ];
    const center = handles[0].point;
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    for (const handle of handles.slice(1)) {
      ctx.beginPath(); ctx.moveTo(...center); ctx.lineTo(...handle.point); ctx.stroke();
    }
    for (const handle of handles) {
      const point = handle.point;
      ctx.beginPath(); ctx.arc(point[0], point[1], 7, 0, Math.PI * 2); ctx.fillStyle = '#071015'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
      ctx.font = '700 11px "Segoe UI"'; ctx.fillStyle = '#ffffff';
      ctx.fillText(handle.label, point[0] + 10, point[1] - 8);
    }
    ctx.setLineDash([7, 5]);
  }

  function selectedMarkers() {
    const region = currentRegion();
    if (region?.ownership === 'placeholder') return [];
    if (region?.ownership === 'source-panel-containment') {
      return floorMarkers().filter(marker => insideRegion(markerSourcePixel(marker), region));
    }
    return floorMarkers().filter(marker => (marker.coordinateValidation?.calibration?.id || 'all') === state.region);
  }

  function markerSourcePixel(marker) {
    return [Number(marker.sourcePosition[1]), Number(marker.sourceCanvas[1]) - Number(marker.sourcePosition[0])];
  }

  function candidateMarkers() {
    const registration = calculateRegistration();
    return selectedMarkers().map(marker => {
      const source = markerSourcePixel(marker);
      const sourceInRegion = insideCurrentSourceRegion(source);
      const mapped = registration.ready && sourceInRegion ? mapSourceToTarget(source, registration) : null;
      return { marker, source, sourceInRegion, mapped };
    });
  }

  function drawSourceMarkers(ctx, viewer) {
    if (!state.showMarkers) return;
    ctx.save();
    for (const item of candidateMarkers()) {
      const p = viewer.nativeToScreen(item.source);
      ctx.fillStyle = 'rgba(255,176,32,.85)'; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawCandidateMarkers(ctx, viewer) {
    if (!state.showMarkers) return;
    ctx.save();
    for (const item of candidateMarkers()) {
      if (!item.mapped) continue;
      const p = viewer.nativeToScreen(item.mapped.point);
      ctx.strokeStyle = item.mapped.fallback ? '#ffb020' : '#00e5ff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p[0] - 5, p[1]); ctx.lineTo(p[0] + 5, p[1]); ctx.moveTo(p[0], p[1] - 5); ctx.lineTo(p[0], p[1] + 5); ctx.stroke();
    }
    ctx.restore();
  }

  function calculateRegistration() {
    const controls = state.points.filter(point => point.enabled && point.type === 'control' && pointInsideCurrentRegion(point));
    const minimum = state.model === 'similarity' ? 2 : 3;
    const result = { ready: controls.length >= minimum, controls, triangles: [], forwardGlobal: null, reverseGlobal: null };
    if (controls.length >= 2) {
      result.forwardSimilarity = fitSimilarity(controls.map(point => [point.source, point.target]));
      result.reverseSimilarity = fitSimilarity(controls.map(point => [point.target, point.source]));
    }
    if (controls.length >= 3) {
      result.forwardAffine = fitAffine(controls.map(point => [point.source, point.target]));
      result.reverseAffine = fitAffine(controls.map(point => [point.target, point.source]));
    }
    if (state.model === 'similarity') {
      result.forwardGlobal = result.forwardSimilarity;
      result.reverseGlobal = result.reverseSimilarity;
    } else {
      result.forwardGlobal = result.forwardAffine;
      result.reverseGlobal = result.reverseAffine;
    }
    if (controls.length >= 3) result.triangles = buildTriangles(controls);
    return result;
  }

  function mapSourceToTarget(point, registration) {
    if (!insideCurrentSourceRegion(point)) return null;
    if (state.model === 'piecewise' && registration.triangles.length) {
      for (let index = 0; index < registration.triangles.length; index++) {
        const triangle = registration.triangles[index];
        if (triangle.folded) continue;
        const weights = barycentric(point, triangle.source);
        if (weights && weights.every(value => value >= -1e-7 && value <= 1 + 1e-7)) {
          return acceptCurrentTargetRegion({
            point: [
              weights[0] * triangle.target[0][0] + weights[1] * triangle.target[1][0] + weights[2] * triangle.target[2][0],
              weights[0] * triangle.target[0][1] + weights[1] * triangle.target[1][1] + weights[2] * triangle.target[2][1]
            ],
            triangle: index,
            fallback: false
          });
        }
      }
      if (!state.allowGlobalFallback || !registration.forwardAffine) return null;
      return acceptCurrentTargetRegion({ point: applyAffine(registration.forwardAffine, point), triangle: null, fallback: true });
    }
    if (!registration.forwardGlobal) return null;
    return acceptCurrentTargetRegion({ point: applyAffine(registration.forwardGlobal, point), triangle: null, fallback: false });
  }

  function acceptCurrentTargetRegion(mapping) {
    return mapping && insideCurrentTargetRegion(mapping.point) ? mapping : null;
  }

  function buildTriangles(controls) {
    const indices = delaunay(controls.map(point => point.source));
    return indices.map(ids => {
      const source = ids.map(index => controls[index].source);
      const target = ids.map(index => controls[index].target);
      const sourceArea = signedArea(source), targetArea = signedArea(target);
      const affine = exactAffine(source, target);
      return {
        ids: ids.map(index => controls[index].id), source, target,
        folded: sourceArea * targetArea <= 0,
        sourceArea: Math.abs(sourceArea), targetArea: Math.abs(targetArea),
        condition: affine ? affineCondition(affine) : Infinity
      };
    });
  }

  function fitSimilarity(pairs) {
    let sx = 0, sy = 0, tx = 0, ty = 0;
    for (const [source, target] of pairs) { sx += source[0]; sy += source[1]; tx += target[0]; ty += target[1]; }
    sx /= pairs.length; sy /= pairs.length; tx /= pairs.length; ty /= pairs.length;
    let dot = 0, cross = 0, denominator = 0;
    for (const [source, target] of pairs) {
      const x = source[0] - sx, y = source[1] - sy, u = target[0] - tx, v = target[1] - ty;
      dot += x * u + y * v; cross += x * v - y * u; denominator += x * x + y * y;
    }
    if (denominator < 1e-9) return null;
    const a = dot / denominator, b = cross / denominator;
    return [a, -b, tx - a * sx + b * sy, b, a, ty - b * sx - a * sy];
  }

  function fitAffine(pairs) {
    const fitAxis = axis => {
      const normal = Array.from({ length: 3 }, () => Array(4).fill(0));
      for (const [source, target] of pairs) {
        const vector = [source[0], source[1], 1];
        for (let row = 0; row < 3; row++) {
          for (let column = 0; column < 3; column++) normal[row][column] += vector[row] * vector[column];
          normal[row][3] += vector[row] * target[axis];
        }
      }
      return solveLinearSystem(normal);
    };
    try {
      const x = fitAxis(0), y = fitAxis(1);
      return [x[0], x[1], x[2], y[0], y[1], y[2]];
    } catch { return null; }
  }

  function exactAffine(from, to) {
    return fitAffine(from.map((point, index) => [point, to[index]]));
  }

  function applyAffine(model, point) {
    if (!model) return null;
    return [model[0] * point[0] + model[1] * point[1] + model[2], model[3] * point[0] + model[4] * point[1] + model[5]];
  }

  function solveLinearSystem(matrix) {
    const rows = matrix.map(row => [...row]);
    for (let column = 0; column < rows.length; column++) {
      let pivot = column;
      for (let row = column + 1; row < rows.length; row++) if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
      [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
      const divisor = rows[column][column];
      if (Math.abs(divisor) < 1e-10) throw new Error('singular');
      for (let item = column; item <= rows.length; item++) rows[column][item] /= divisor;
      for (let row = 0; row < rows.length; row++) {
        if (row === column) continue;
        const factor = rows[row][column];
        for (let item = column; item <= rows.length; item++) rows[row][item] -= factor * rows[column][item];
      }
    }
    return rows.map(row => row[rows.length]);
  }

  function delaunay(points) {
    if (points.length < 3) return [];
    const unique = [];
    for (let index = 0; index < points.length; index++) {
      if (unique.every(item => distance(points[index], points[item]) > 1e-5)) unique.push(index);
    }
    if (unique.length < 3) return [];
    const work = unique.map(index => points[index]);
    const xs = work.map(point => point[0]), ys = work.map(point => point[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const delta = Math.max(maxX - minX, maxY - minY) || 1, midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
    work.push([midX - 20 * delta, midY - delta], [midX, midY + 20 * delta], [midX + 20 * delta, midY - delta]);
    const superIds = [work.length - 3, work.length - 2, work.length - 1];
    let triangles = [superIds];
    for (let pointIndex = 0; pointIndex < work.length - 3; pointIndex++) {
      const bad = triangles.filter(triangle => inCircumcircle(work[pointIndex], triangle.map(index => work[index])));
      const edges = [];
      for (const triangle of bad) for (const edge of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
        const reversed = edges.findIndex(item => item[0] === edge[1] && item[1] === edge[0]);
        if (reversed >= 0) edges.splice(reversed, 1); else edges.push(edge);
      }
      triangles = triangles.filter(triangle => !bad.includes(triangle));
      for (const edge of edges) triangles.push([edge[0], edge[1], pointIndex]);
    }
    return triangles.filter(triangle => triangle.every(index => !superIds.includes(index)))
      .map(triangle => triangle.map(index => unique[index]));
  }

  function inCircumcircle(point, triangle) {
    const [a, b, c] = triangle;
    const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    if (Math.abs(d) < 1e-9) return false;
    const aa = a[0] ** 2 + a[1] ** 2, bb = b[0] ** 2 + b[1] ** 2, cc = c[0] ** 2 + c[1] ** 2;
    const ux = (aa * (b[1] - c[1]) + bb * (c[1] - a[1]) + cc * (a[1] - b[1])) / d;
    const uy = (aa * (c[0] - b[0]) + bb * (a[0] - c[0]) + cc * (b[0] - a[0])) / d;
    const radiusSquared = (ux - a[0]) ** 2 + (uy - a[1]) ** 2;
    return (point[0] - ux) ** 2 + (point[1] - uy) ** 2 <= radiusSquared + 1e-7;
  }

  function barycentric(point, triangle) {
    const [a, b, c] = triangle;
    const denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
    if (Math.abs(denominator) < 1e-10) return null;
    const u = ((b[1] - c[1]) * (point[0] - c[0]) + (c[0] - b[0]) * (point[1] - c[1])) / denominator;
    const v = ((c[1] - a[1]) * (point[0] - c[0]) + (a[0] - c[0]) * (point[1] - c[1])) / denominator;
    return [u, v, 1 - u - v];
  }

  function signedArea(triangle) {
    return ((triangle[1][0] - triangle[0][0]) * (triangle[2][1] - triangle[0][1]) - (triangle[1][1] - triangle[0][1]) * (triangle[2][0] - triangle[0][0])) / 2;
  }

  function affineCondition(model) {
    const a = model[0], b = model[1], c = model[3], d = model[4];
    const trace = a * a + b * b + c * c + d * d;
    const determinantSquared = (a * d - b * c) ** 2;
    const discriminant = Math.max(0, trace * trace - 4 * determinantSquared);
    const maxEigen = (trace + Math.sqrt(discriminant)) / 2;
    const minEigen = (trace - Math.sqrt(discriminant)) / 2;
    return minEigen <= 1e-12 ? Infinity : Math.sqrt(maxEigen / minEigen);
  }

  function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function insideImage(point, image) {
    return image && point[0] >= 0 && point[1] >= 0 && point[0] <= image.naturalWidth && point[1] <= image.naturalHeight;
  }
  function insideBounds(point, bounds) {
    return !bounds || (point[0] >= bounds[0] && point[1] >= bounds[1] && point[0] <= bounds[2] && point[1] <= bounds[3]);
  }
  function boundsForSide(side) {
    const region = currentRegion();
    return side === 'source' ? region?.sourceBounds : region?.targetBounds;
  }
  function insideCurrentSourceRegion(point) { return currentRegion()?.custom ? insideRegion(point, currentRegion()) : insideBounds(point, currentRegion()?.sourceBounds); }
  function insideCurrentTargetRegion(point) { return insideBounds(point, currentRegion()?.targetBounds); }
  function pointInsideCurrentRegion(point) {
    return insideCurrentSourceRegion(point.source) && insideCurrentTargetRegion(point.target);
  }
  function clampToBounds(point, bounds) {
    return bounds ? [Math.max(bounds[0], Math.min(bounds[2], point[0])), Math.max(bounds[1], Math.min(bounds[3], point[1]))] : point;
  }
  function clampToImage(point, image) {
    return [Math.max(0, Math.min(image.naturalWidth, point[0])), Math.max(0, Math.min(image.naturalHeight, point[1]))];
  }

  function validationRows(registration) {
    return state.points.filter(point => point.enabled && point.type === 'validation' && pointInsideCurrentRegion(point)).map(point => {
      const mapped = registration.ready ? mapSourceToTarget(point.source, registration) : null;
      return { point, mapped, error: mapped ? distance(mapped.point, point.target) : null };
    });
  }

  function updateUi() {
    const registration = calculateRegistration();
    const validations = validationRows(registration);
    const candidates = candidateMarkers();
    const mappedCandidates = candidates.filter(item => item.mapped);
    const outsideRegionCandidates = candidates.filter(item => !item.sourceInRegion);
    const ignoredPoints = state.points.filter(point => point.enabled && !pointInsideCurrentRegion(point));
    const folded = registration.triangles.filter(triangle => triangle.folded).length;
    const highDistortion = registration.triangles.filter(triangle => !triangle.folded && triangle.condition > 4).length;
    const errors = validations.map(item => item.error).filter(value => value != null).sort((a, b) => a - b);
    const p90 = percentile(errors, 0.9);
    $('sourceBadge').textContent = `${state.sourceImage?.naturalWidth || 0} × ${state.sourceImage?.naturalHeight || 0}`;
    $('targetBadge').textContent = `${state.targetImage?.naturalWidth || 0} × ${state.targetImage?.naturalHeight || 0}`;
    $('overlayBadge').textContent = `${state.region} · 기준점 ${registration.controls.length} · 삼각형 ${registration.triangles.length}`;
    const addRegionButton = $('addRegionButton');
    addRegionButton.hidden = false;
    addRegionButton.classList.toggle('drawing', state.regionDrawMode);
    addRegionButton.textContent = state.regionDrawMode ? '사각형 지정 취소' : '구역 사각형 추가';
    const regionItem = currentRegion();
    const editor = $('customRegionEditor');
    editor.hidden = !regionItem?.custom;
    if (regionItem?.custom) {
      $('regionNameInput').value = regionItem.label;
      const floorSelect = $('regionFloorSelect');
      const optionsKey = [...floorSelect.options].map(item => item.value).join('|');
      const wantedKey = MAPS[state.map].floors.map(item => item.id).join('|');
      if (optionsKey !== wantedKey) {
        floorSelect.innerHTML = '';
        for (const floorItem of MAPS[state.map].floors) floorSelect.add(new Option(floorItem.label, floorItem.id));
      }
      floorSelect.value = regionItem.floorId;
    }
    $('pendingText').textContent = state.pendingSource
      ? `원본 (${round(state.pendingSource[0])}, ${round(state.pendingSource[1])}) 선택됨 — 오른쪽에서 같은 지점을 클릭`
      : `현재 ${state.pointMode === 'control' ? '기준점' : '검증점'} 모드 — 원본 지도에서 첫 점을 찍으세요.`;
    $('statusGrid').innerHTML = [
      stat('기준점', `${registration.controls.length}/${MIN_CONTROL_POINTS}`, registration.controls.length >= MIN_CONTROL_POINTS),
      stat('검증점', `${validations.length}/${MIN_VALIDATION_POINTS}`, validations.length >= MIN_VALIDATION_POINTS),
      stat('검증 p90', p90 == null ? '—' : `${p90.toFixed(1)}px`, p90 != null && p90 <= 10),
      stat('뒤집힌 삼각형', folded, folded === 0),
      stat('과변형 삼각형', highDistortion, highDistortion === 0),
      stat('매핑 마커', `${mappedCandidates.length}/${candidates.length}`, mappedCandidates.length === candidates.length)
    ].join('');
    const warnings = [];
    if (!registration.ready) warnings.push(['삼각망 미리보기에 필요한 기준점이 부족합니다.', 'info']);
    if (registration.controls.length < MIN_CONTROL_POINTS) warnings.push([`후보 좌표를 내보내려면 기준점을 ${MIN_CONTROL_POINTS}개 이상 추가해야 합니다.`, 'info']);
    if (validations.length < MIN_VALIDATION_POINTS) warnings.push([`계산에 사용하지 않는 검증점을 최소 ${MIN_VALIDATION_POINTS}개 추가해야 확정할 수 있습니다.`, 'info']);
    if (folded) warnings.push([`${folded}개 삼각형이 뒤집혔습니다. 해당 구역 마커는 제외됩니다.`, 'bad']);
    if (highDistortion) warnings.push([`${highDistortion}개 삼각형의 축 비율 왜곡이 4배를 넘습니다.`, 'bad']);
    if (candidates.length - mappedCandidates.length) warnings.push([`${candidates.length - mappedCandidates.length}개 마커가 삼각망 밖이라 격리됩니다.`, 'info']);
    if (outsideRegionCandidates.length) warnings.push([`${outsideRegionCandidates.length}개 마커가 현재 원본 구역 경계 밖이라 강제 격리됩니다.`, 'bad']);
    if (ignoredPoints.length) warnings.push([`${ignoredPoints.length}개 대응점이 현재 구역 밖이라 계산에서 제외됩니다.`, 'bad']);
    $('warnings').innerHTML = warnings.map(([text, type]) => `<div class="warning ${type === 'info' ? 'info' : ''}">${escapeHtml(text)}</div>`).join('');
    renderPointTable(validations);
  }

  function stat(label, value, ok) {
    return `<div class="stat ${ok ? 'ok' : 'bad'}"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function renderPointTable(validations) {
    const errorById = new Map(validations.map(item => [item.point.id, item.error]));
    $('pointTableBody').innerHTML = state.points.map(point => {
      const error = errorById.get(point.id);
      return `<tr data-id="${point.id}">
        <td><label><input class="enabled-toggle" type="checkbox" ${point.enabled ? 'checked' : ''}> ${point.id}</label></td>
        <td><select class="type-select"><option value="control" ${point.type === 'control' ? 'selected' : ''}>기준점</option><option value="validation" ${point.type === 'validation' ? 'selected' : ''}>검증점</option></select></td>
        <td><input class="name-input" type="text" value="${escapeHtml(point.name)}"></td>
        <td>${round(point.source[0])}, ${round(point.source[1])}</td>
        <td>${round(point.target[0])}, ${round(point.target[1])}</td>
        <td class="${error == null ? '' : error <= 10 ? 'error-good' : 'error-bad'}">${error == null ? '—' : `${error.toFixed(2)}px`}</td>
        <td><button class="row-delete" type="button">삭제</button></td>
      </tr>`;
    }).join('');
    for (const row of $('pointTableBody').querySelectorAll('tr')) {
      const id = Number(row.dataset.id);
      const point = state.points.find(item => item.id === id);
      row.querySelector('.enabled-toggle').addEventListener('change', event => { snapshot(); point.enabled = event.target.checked; persistCurrent(); renderAll(); });
      row.querySelector('.type-select').addEventListener('change', event => { snapshot(); point.type = event.target.value; persistCurrent(); renderAll(); });
      row.querySelector('.name-input').addEventListener('change', event => { snapshot(); point.name = event.target.value; persistCurrent(); renderAll(); });
      row.querySelector('.row-delete').addEventListener('click', () => { snapshot(); state.points = state.points.filter(item => item.id !== id); persistCurrent(); renderAll(); });
    }
  }

  function percentile(values, p) {
    if (!values.length) return null;
    return values[Math.min(values.length - 1, Math.max(0, Math.ceil(values.length * p) - 1))];
  }

  function saveProject() {
    const project = currentProject();
    downloadJson(`wtfmi-alignment-${state.map}-${state.floor}-${safeFilePart(state.region)}.json`, project);
  }

  async function loadProject(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const project = JSON.parse(await file.text());
      if (!MAPS[project.map] || !MAPS[project.map].floors.some(item => item.id === project.floor)) throw new Error('지원하지 않는 맵 또는 층');
      saveCurrentToStore();
      state.map = project.map; state.floor = project.floor;
      $('mapSelect').value = state.map;
      $('floorSelect').innerHTML = '';
      for (const item of MAPS[state.map].floors) $('floorSelect').add(new Option(item.label, item.id));
      if (project.customRegion?.id && project.customRegion?.sourceBounds) {
        const list = state.customRegions[state.map] ||= [];
        const imported = {
          id: project.customRegion.id,
          label: project.customRegion.label || project.customRegion.id,
          floorId: project.customRegion.floorId || project.floor,
          displayIndex: project.customRegion.displayIndex,
          colorIndex: project.customRegion.colorIndex,
          geometry: project.customRegion.geometry || geometryFromBounds(project.customRegion.sourceBounds),
          sourceBounds: project.customRegion.sourceBounds,
          targetBounds: project.customRegion.targetBounds || null,
          createdAt: project.customRegion.createdAt || new Date().toISOString()
        };
        const index = list.findIndex(item => item.id === imported.id);
        if (index >= 0) list[index] = imported; else list.push(imported);
        persistCustomRegions();
      }
      state.region = project.region || regionDefinitions()[0].id;
      if (!regionDefinitions().some(item => item.id === state.region)) throw new Error('현재 데이터에 없는 정합 구역');
      state.projectStore[selectionKey()] = { ...project, region: state.region };
      await loadSelection();
      toast('프로젝트를 불러왔습니다.');
    } catch (error) { toast(`불러오기 실패: ${error.message}`, true); }
  }

  function exportCandidates() {
    const registration = calculateRegistration();
    const validations = validationRows(registration);
    const folded = registration.triangles.filter(triangle => triangle.folded).length;
    const p90 = percentile(validations.map(item => item.error).filter(value => value != null).sort((a, b) => a - b), 0.9);
    if (!registration.ready) { toast('삼각망을 만들 기준점이 부족합니다.', true); return; }
    if (registration.controls.length < MIN_CONTROL_POINTS) { toast(`후보 좌표 내보내기에는 기준점 ${MIN_CONTROL_POINTS}개가 필요합니다.`, true); return; }
    const targetWidth = state.targetImage.naturalWidth, targetHeight = state.targetImage.naturalHeight;
    const candidates = candidateMarkers().map(item => ({
      id: item.marker.id,
      floor: currentRegion()?.custom ? currentFloor().markerFloors[0] : item.marker.floor,
      sourcePixel: item.source.map(round3),
      mapped: Boolean(item.mapped),
      fallback: item.mapped?.fallback || false,
      triangle: item.mapped?.triangle ?? null,
      targetPixel: item.mapped ? item.mapped.point.map(round3) : null,
      mapPosition: item.mapped ? [item.mapped.point[0] / targetWidth * 100, item.mapped.point[1] / targetHeight * 100].map(round6) : null
    }));
    const payload = {
      schema: 'wtfmi-alignment-candidates-v1', generatedAt: new Date().toISOString(), appliedToProductionData: false,
      map: state.map, floor: state.floor, region: state.region, model: state.model,
      regionBounds: { source: currentRegion()?.sourceBounds || null, target: currentRegion()?.targetBounds || null },
      sourceImage: { path: MAPS[state.map].source, width: state.sourceImage.naturalWidth, height: state.sourceImage.naturalHeight },
      targetImage: { path: currentFloor().target, width: targetWidth, height: targetHeight },
      validation: { controlCount: registration.controls.length, validationCount: validations.length, p90Pixels: p90, foldedTriangles: folded },
      controls: state.points,
      candidates
    };
    downloadJson(`wtfmi-candidates-${state.map}-${state.floor}-${safeFilePart(state.region)}.json`, payload);
    toast(`후보 ${candidates.filter(item => item.mapped).length}개를 내보냈습니다. 실제 데이터는 변경하지 않았습니다.`);
  }

  function currentProject() {
    return {
      schema: 'wtfmi-alignment-project-v2', savedAt: new Date().toISOString(), map: state.map, floor: state.floor, region: state.region,
      customRegion: currentRegion()?.custom ? structuredClone(currentRegion()) : null,
      regionBounds: { source: currentRegion()?.sourceBounds || null, target: currentRegion()?.targetBounds || null },
      model: state.model, opacity: state.opacity, showTriangles: state.showTriangles, showMarkers: state.showMarkers,
      allowGlobalFallback: state.allowGlobalFallback, points: structuredClone(state.points)
    };
  }

  function persistCurrent() { saveCurrentToStore(); localStorage.setItem('wtfmi-alignment-projects-v1', JSON.stringify(state.projectStore)); persistCustomRegions(); }
  function saveCurrentToStore() { if (state.map && state.floor && state.region) state.projectStore[selectionKey()] = currentProject(); }
  function loadStoredProjects() {
    try { return JSON.parse(localStorage.getItem('wtfmi-alignment-projects-v1') || '{}'); } catch { return {}; }
  }
  function persistCustomRegions() { localStorage.setItem('wtfmi-alignment-custom-regions-v1', JSON.stringify(state.customRegions)); }
  function loadStoredCustomRegions() {
    try {
      const value = JSON.parse(localStorage.getItem('wtfmi-alignment-custom-regions-v1') || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch { return {}; }
  }

  function githubToken() { return unlockedGithubToken; }
  async function loadHostedTokenVault() {
    try {
      const response = await fetch('./config/token-vault.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const vault = await response.json();
      if (
        vault?.schema !== TOKEN_VAULT.schema || vault.algorithm !== 'AES-256-GCM' ||
        vault.passwordLength !== TOKEN_VAULT.passwordLength || vault.randomKeyLength !== TOKEN_VAULT.randomKeyLength ||
        vault.kdf?.name !== 'PBKDF2' || vault.kdf?.hash !== 'SHA-256' ||
        !vault.kdf?.salt || !vault.wrappedKey?.iv || !vault.wrappedKey?.ciphertext ||
        !vault.token?.iv || !vault.token?.ciphertext
      ) throw new Error('암호화 설정 형식이 올바르지 않습니다.');
      hostedTokenVault = vault;
      hostedTokenVaultError = '';
    } catch (error) {
      hostedTokenVault = null;
      hostedTokenVaultError = error.message;
    }
  }
  function encryptedTokenVault() { return hostedTokenVault; }
  function updateTokenVaultUi() {
    if (unlockedGithubToken) setGithubSyncStatus('암호화 토큰 잠금 해제됨');
    else if (encryptedTokenVault()) setGithubSyncStatus('10자리 비밀번호를 입력해 잠금을 해제하세요.');
    else setGithubSyncStatus(`암호화 설정을 불러오지 못했습니다${hostedTokenVaultError ? ` · ${hostedTokenVaultError}` : ''}`, 'error');
  }
  function validVaultPassword(password) { return Array.from(password).length === TOKEN_VAULT.passwordLength; }
  async function unlockGithubToken() {
    const vault = encryptedTokenVault();
    if (!vault) { toast('암호화 설정을 불러오지 못했습니다.', true); return; }
    const password = $('githubPasswordInput').value;
    if (!validVaultPassword(password)) { toast('비밀번호 10자리를 입력하세요.', true); return; }
    setGithubSyncStatus('암호화 토큰을 푸는 중…', 'busy');
    try {
      unlockedGithubToken = await decryptTokenVault(vault, password);
      $('githubPasswordInput').value = '';
      if (!await validateGithubToken()) { unlockedGithubToken = ''; return; }
    } catch {
      unlockedGithubToken = '';
      setGithubSyncStatus('잠금 해제 실패 · 비밀번호가 틀리거나 설정 파일이 손상됐습니다.', 'error');
      toast('비밀번호를 확인하세요.', true);
    }
  }
  function lockGithubToken() {
    unlockedGithubToken = '';
    $('githubPasswordInput').value = '';
    updateTokenVaultUi();
    toast('복호화된 토큰을 메모리에서 제거했습니다.');
  }
  async function decryptTokenVault(vault, password) {
    const passwordKey = await derivePasswordAesKey(password, base64ToBytes(vault.kdf.salt), Number(vault.kdf.iterations));
    const randomKeyBytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(vault.wrappedKey.iv) }, passwordKey, base64ToBytes(vault.wrappedKey.ciphertext));
    const randomKey = new TextDecoder().decode(randomKeyBytes);
    if (Array.from(randomKey).length !== TOKEN_VAULT.randomKeyLength) throw new Error('난수 키 길이 불일치');
    const tokenKey = await deriveRandomTokenKey(randomKey);
    const tokenBytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(vault.token.iv) }, tokenKey, base64ToBytes(vault.token.ciphertext));
    return new TextDecoder().decode(tokenBytes);
  }
  async function derivePasswordAesKey(password, salt, iterations = TOKEN_VAULT.pbkdf2Iterations) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function deriveRandomTokenKey(randomKey) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(randomKey));
    return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  function base64ToBytes(value) {
    const binary = atob(String(value).replace(/\s/g, ''));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }
  function githubApiUrl() {
    return `https://api.github.com/repos/${GITHUB_SYNC.owner}/${GITHUB_SYNC.repo}/contents/${GITHUB_SYNC.path}`;
  }
  function githubHeaders(includeToken = true) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_SYNC.apiVersion
    };
    const token = githubToken();
    if (includeToken && token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
  function setGithubSyncStatus(message, mode = '') {
    const status = $('githubSyncStatus');
    status.textContent = message;
    status.className = `sync-status ${mode}`.trim();
    const busy = mode === 'busy';
    $('githubLoadButton').disabled = busy;
    $('githubSaveButton').disabled = busy;
    $('githubUnlockButton').disabled = busy;
  }
  async function githubError(response) {
    try {
      const value = await response.json();
      return value.message || `${response.status} ${response.statusText}`;
    } catch { return `${response.status} ${response.statusText}`; }
  }
  function requireGithubToken() {
    if (githubToken()) return true;
    setGithubSyncStatus('10자리 비밀번호로 토큰 잠금을 먼저 해제하세요.', 'error');
    $('githubPasswordInput').focus();
    return false;
  }
  async function verifyGithubIdentity() {
    const response = await fetch('https://api.github.com/user', { headers: githubHeaders(true), cache: 'no-store' });
    if (!response.ok) throw new Error(await githubError(response));
    const user = await response.json();
    if (String(user.login).toLowerCase() !== GITHUB_SYNC.owner.toLowerCase()) {
      throw new Error(`허용되지 않은 GitHub 계정: ${user.login}`);
    }
    const repositoryResponse = await fetch(`https://api.github.com/repos/${GITHUB_SYNC.owner}/${GITHUB_SYNC.repo}`, {
      headers: githubHeaders(true), cache: 'no-store'
    });
    if (repositoryResponse.status === 404) {
      throw new Error(`이 토큰에 ${GITHUB_SYNC.repo} 비공개 저장소 접근 권한이 없습니다.`);
    }
    if (!repositoryResponse.ok) throw new Error(await githubError(repositoryResponse));
    return user;
  }
  async function getGithubStateFile() {
    const response = await fetch(`${githubApiUrl()}?ref=${encodeURIComponent(GITHUB_SYNC.branch)}&t=${Date.now()}`, {
      headers: githubHeaders(true), cache: 'no-store'
    });
    if (response.status === 404) throw new Error(`토큰의 ${GITHUB_SYNC.repo} 접근 권한 또는 상태 파일을 확인하세요.`);
    if (!response.ok) throw new Error(await githubError(response));
    const file = await response.json();
    const statePayload = JSON.parse(decodeBase64Utf8(file.content));
    return { file, statePayload };
  }
  async function validateGithubToken() {
    if (!requireGithubToken()) return false;
    setGithubSyncStatus('GitHub 토큰을 검증하는 중…', 'busy');
    try {
      const user = await verifyGithubIdentity();
      const result = await getGithubStateFile();
      const payload = result.statePayload;
      if (payload.schema !== 'wtfmi-alignment-cloud-state-v1' || !payload.projects || !payload.customRegions) {
        throw new Error('정합 상태 파일 형식이 잘못됐습니다.');
      }
      const projectCount = Object.keys(payload.projects).length;
      setGithubSyncStatus(`토큰 검증 완료 · ${user.login} · 최신 프로젝트 ${projectCount}개`);
      toast(`GitHub 토큰과 비공개 저장소 접근을 확인했습니다.`);
      return true;
    } catch (error) {
      setGithubSyncStatus(`토큰 검증 실패 · ${error.message}`, 'error');
      toast(`GitHub 토큰 검증 실패: ${error.message}`, true);
      return false;
    }
  }
  async function loadStateFromGithub() {
    if (!requireGithubToken()) return;
    if (!window.confirm('GitHub에 저장된 상태로 현재 브라우저의 전체 정합 상태를 교체할까요?')) return;
    setGithubSyncStatus('GitHub에서 불러오는 중…', 'busy');
    try {
      await verifyGithubIdentity();
      const result = await getGithubStateFile();
      const payload = result.statePayload;
      if (payload.schema !== 'wtfmi-alignment-cloud-state-v1' || !payload.projects || !payload.customRegions) {
        throw new Error('지원하지 않는 GitHub 상태 파일입니다.');
      }
      state.projectStore = structuredClone(payload.projects);
      state.customRegions = structuredClone(payload.customRegions);
      localStorage.setItem('wtfmi-alignment-projects-v1', JSON.stringify(state.projectStore));
      persistCustomRegions();
      state.region = null;
      await loadSelection();
      setGithubSyncStatus(`GitHub 불러오기 완료 · ${new Date(payload.savedAt).toLocaleString()}`);
      toast('GitHub의 전체 정합 상태를 불러왔습니다.');
    } catch (error) {
      setGithubSyncStatus(`불러오기 실패 · ${error.message}`, 'error');
      toast(`GitHub 불러오기 실패: ${error.message}`, true);
    }
  }
  async function saveStateToGithub() {
    if (!requireGithubToken()) return;
    if (!window.confirm('GitHub 저장소에 현재 전체 정합 상태를 커밋할까요?')) return;
    persistCurrent();
    setGithubSyncStatus('GitHub에 저장하는 중…', 'busy');
    try {
      await verifyGithubIdentity();
      const existing = await getGithubStateFile();
      const payload = {
        schema: 'wtfmi-alignment-cloud-state-v1', savedAt: new Date().toISOString(),
        savedFrom: `${location.origin}${location.pathname}`,
        projects: state.projectStore, customRegions: state.customRegions
      };
      const body = {
        message: `Save alignment state ${payload.savedAt}`,
        branch: GITHUB_SYNC.branch,
        content: encodeBase64Utf8(`${JSON.stringify(payload, null, 2)}\n`)
      };
      if (existing?.file?.sha) body.sha = existing.file.sha;
      const response = await fetch(githubApiUrl(), {
        method: 'PUT', headers: { ...githubHeaders(true), 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(await githubError(response));
      const result = await response.json();
      setGithubSyncStatus(`GitHub 저장 완료 · ${new Date(payload.savedAt).toLocaleString()}`);
      toast(`GitHub 저장 완료: ${String(result.commit?.sha || '').slice(0, 7)}`);
    } catch (error) {
      setGithubSyncStatus(`저장 실패 · ${error.message}`, 'error');
      toast(`GitHub 저장 실패: ${error.message}`, true);
    }
  }
  function encodeBase64Utf8(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary);
  }
  function decodeBase64Utf8(value) {
    const binary = atob(String(value).replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function downloadJson(fileName, value) {
    const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = fileName; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function toast(message, error = false) {
    const element = $('toast');
    element.textContent = message;
    element.style.background = error ? '#3c121a' : '#12313d';
    element.style.borderColor = error ? '#8c3040' : '#24738d';
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2800);
  }

  function round(value) { return Number(value).toFixed(1); }
  function round3(value) { return Number(value.toFixed(3)); }
  function round6(value) { return Number(value.toFixed(6)); }
  function safeFilePart(value) { return String(value || 'all').replace(/[^a-z0-9._-]+/gi, '-'); }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }

  function Viewer(canvas, side) {
    this.canvas = canvas;
    this.side = side;
    this.image = null;
    this.view = { scale: 1, x: 0, y: 0 };
    this.dpr = window.devicePixelRatio || 1;
    this.drag = null;
    this.pointDrag = null;
    this.regionDrag = null;
    this.regionHandleDrag = null;
    const resize = () => {
      this.dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(canvas.clientWidth * this.dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * this.dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; this.draw(); }
    };
    new ResizeObserver(resize).observe(canvas);
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
      const point = this.eventPoint(event);
      this.view.x = point[0] - (point[0] - this.view.x) * factor;
      this.view.y = point[1] - (point[1] - this.view.y) * factor;
      this.view.scale *= factor;
      this.draw();
    }, { passive: false });
    canvas.addEventListener('pointerdown', event => {
      canvas.setPointerCapture(event.pointerId);
      const screen = this.eventPoint(event);
      if (event.button === 1 || state.spaceDown || side === 'overlay') {
        this.drag = { screen, view: { ...this.view } };
        return;
      }
      if (event.button !== 0) return;
      if (side === 'source' && state.regionDrawMode) {
        const native = clampToImage(this.screenToNative(screen), state.sourceImage);
        this.regionDrag = { start: native, end: native };
        state.regionDraft = this.regionDrag;
        this.draw();
        return;
      }
      if (side === 'source') {
        const regionHandle = this.hitRegionHandle(screen);
        if (regionHandle) {
          const stored = (state.customRegions[state.map] || []).find(item => item.id === state.region);
          if (stored) {
            const normalized = currentRegion();
            stored.geometry = structuredClone(normalized.geometry);
            stored.sourceBounds = structuredClone(normalized.sourceBounds);
            this.regionHandleDrag = { item: stored, handleType: regionHandle.handleType, original: structuredClone(stored) };
            return;
          }
        }
      }
      const hit = this.hitPoint(screen);
      if (hit) {
        snapshot();
        this.pointDrag = { point: hit, coordinateSide: side };
        return;
      }
      handlePointClick(side, this.screenToNative(screen));
    });
    canvas.addEventListener('pointermove', event => {
      const screen = this.eventPoint(event);
      if (this.drag) {
        this.view.x = this.drag.view.x + screen[0] - this.drag.screen[0];
        this.view.y = this.drag.view.y + screen[1] - this.drag.screen[1];
        this.draw();
      } else if (this.regionDrag) {
        this.regionDrag.end = clampToImage(this.screenToNative(screen), state.sourceImage);
        state.regionDraft = this.regionDrag;
        renderAll();
      } else if (this.regionHandleDrag) {
        const moving = clampToImage(this.screenToNative(screen), state.sourceImage);
        updateRegionFromHandle(this.regionHandleDrag.item, this.regionHandleDrag.handleType, moving, this.regionHandleDrag.original.geometry);
        renderAll();
      } else if (this.pointDrag) {
        const image = this.pointDrag.coordinateSide === 'source' ? state.sourceImage : state.targetImage;
        const imagePoint = clampToImage(this.screenToNative(screen), image);
        this.pointDrag.point[this.pointDrag.coordinateSide] = clampToBounds(imagePoint, boundsForSide(this.pointDrag.coordinateSide));
        renderAll();
      }
    });
    const endDrag = () => {
      if (this.regionDrag) finishCustomRegion(this.regionDrag.start, this.regionDrag.end);
      if (this.regionHandleDrag) {
        const error = invalidRegionGeometry(this.regionHandleDrag.item);
        if (error) {
          Object.assign(this.regionHandleDrag.item, this.regionHandleDrag.original);
          toast(error, true);
        } else {
          persistCustomRegions(); persistCurrent(); populateRegionSelect();
        }
      }
      if (this.pointDrag) persistCurrent();
      this.drag = null; this.pointDrag = null; this.regionDrag = null; this.regionHandleDrag = null;
      state.regionDraft = null;
      renderAll();
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
  }

  Viewer.prototype.context = function context() { return this.canvas.getContext('2d'); };
  Viewer.prototype.setImage = function setImage(image) { this.image = image; this.fit(); };
  Viewer.prototype.fit = function fit() {
    if (!this.image || !this.canvas.clientWidth || !this.canvas.clientHeight) return;
    this.view.scale = Math.min(this.canvas.clientWidth / this.image.naturalWidth, this.canvas.clientHeight / this.image.naturalHeight) * 0.94;
    this.view.x = (this.canvas.clientWidth - this.image.naturalWidth * this.view.scale) / 2;
    this.view.y = (this.canvas.clientHeight - this.image.naturalHeight * this.view.scale) / 2;
    this.draw();
  };
  Viewer.prototype.fitBounds = function fitBounds(bounds) {
    if (!this.image || !Array.isArray(bounds) || bounds.length !== 4 || !this.canvas.clientWidth || !this.canvas.clientHeight) return this.fit();
    const left = Math.max(0, Math.min(this.image.naturalWidth, Number(bounds[0])));
    const top = Math.max(0, Math.min(this.image.naturalHeight, Number(bounds[1])));
    const right = Math.max(left + 1, Math.min(this.image.naturalWidth, Number(bounds[2])));
    const bottom = Math.max(top + 1, Math.min(this.image.naturalHeight, Number(bounds[3])));
    const width = right - left, height = bottom - top;
    this.view.scale = Math.min(this.canvas.clientWidth / width, this.canvas.clientHeight / height) * 0.82;
    this.view.x = (this.canvas.clientWidth - width * this.view.scale) / 2 - left * this.view.scale;
    this.view.y = (this.canvas.clientHeight - height * this.view.scale) / 2 - top * this.view.scale;
    this.draw();
  };
  Viewer.prototype.draw = function draw() { drawViewer(this); };
  Viewer.prototype.nativeToScreen = function nativeToScreen(point) { return [point[0] * this.view.scale + this.view.x, point[1] * this.view.scale + this.view.y]; };
  Viewer.prototype.screenToNative = function screenToNative(point) { return [(point[0] - this.view.x) / this.view.scale, (point[1] - this.view.y) / this.view.scale]; };
  Viewer.prototype.eventPoint = function eventPoint(event) { const rect = this.canvas.getBoundingClientRect(); return [event.clientX - rect.left, event.clientY - rect.top]; };
  Viewer.prototype.hitPoint = function hitPoint(screen) {
    if (this.side === 'overlay') return null;
    const coordinateSide = this.side;
    let best = null, bestDistance = 12;
    for (const point of state.points) {
      const pointScreen = this.nativeToScreen(point[coordinateSide]);
      const value = distance(screen, pointScreen);
      if (value < bestDistance) { best = point; bestDistance = value; }
    }
    return best;
  };
  Viewer.prototype.hitRegionHandle = function hitRegionHandle(screen) {
    if (this.side !== 'source') return null;
    const item = currentRegion();
    if (!item?.custom) return null;
    const handles = regionHandlePoints(item.geometry);
    for (const handleType of ['center', 'width', 'height']) {
      if (distance(screen, this.nativeToScreen(handles[handleType])) <= 14) return { handleType };
    }
    return null;
  };
})();
