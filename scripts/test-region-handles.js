const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
if (source.includes('rotatedRectanglesOverlap') || source.includes('사각형과 겹칠 수 없습니다')) throw new Error('Rectangle overlap restriction remains');
if (!source.includes('if (registration.customRegion)') || !source.includes('regionAffine: true')) throw new Error('Rectangle-scoped affine mapping is missing');
const start = source.indexOf('  function rotatedCorners');
const end = source.indexOf('  function invalidRegionGeometry', start);
if (start < 0 || end < 0) throw new Error('Region geometry functions not found');

const factory = new Function('round3', `${source.slice(start, end)}\nreturn { rotatedCorners, insideRegion, regionHandlePoints, updateRegionFromHandle };`);
const { rotatedCorners, insideRegion, regionHandlePoints, updateRegionFromHandle } = factory(value => Number(value.toFixed(3)));
const base = { center: [100, 200], width: 80, height: 40, angle: Math.PI / 6 };
const baseCorners = rotatedCorners(base);

const movedFirst = { geometry: structuredClone(base) };
const firstTarget = [baseCorners[0][0] - 20, baseCorners[0][1] + 10];
updateRegionFromHandle(movedFirst, 'source', 'corner1', firstTarget, base);
const movedFirstCorners = rotatedCorners(movedFirst.geometry);
if (Math.hypot(movedFirstCorners[0][0] - firstTarget[0], movedFirstCorners[0][1] - firstTarget[1]) > 1e-9) throw new Error('Corner 1 did not follow the cursor');
if (Math.hypot(movedFirstCorners[1][0] - baseCorners[1][0], movedFirstCorners[1][1] - baseCorners[1][1]) > 1e-9) throw new Error('Corner 2 should anchor corner 1 edits');

const movedSecond = { geometry: structuredClone(base) };
const secondTarget = [baseCorners[0][0] + 100, baseCorners[0][1]];
updateRegionFromHandle(movedSecond, 'source', 'corner2', secondTarget, base);
const movedSecondCorners = rotatedCorners(movedSecond.geometry);
if (Math.hypot(movedSecondCorners[0][0] - baseCorners[0][0], movedSecondCorners[0][1] - baseCorners[0][1]) > 1e-9) throw new Error('Corner 1 should anchor corner 2 edits');
if (Math.hypot(movedSecondCorners[1][0] - secondTarget[0], movedSecondCorners[1][1] - secondTarget[1]) > 1e-9) throw new Error('Corner 2 did not follow the cursor');

const movedThird = { geometry: structuredClone(base) };
const normal = [-Math.sin(base.angle), Math.cos(base.angle)];
const thirdTarget = [baseCorners[1][0] + normal[0] * 70, baseCorners[1][1] + normal[1] * 70];
updateRegionFromHandle(movedThird, 'source', 'corner3', thirdTarget, base);
const movedThirdCorners = rotatedCorners(movedThird.geometry);
if (Math.hypot(movedThirdCorners[2][0] - thirdTarget[0], movedThirdCorners[2][1] - thirdTarget[1]) > 1e-9) throw new Error('Corner 3 did not follow the perpendicular cursor position');
if (Math.abs(movedThird.geometry.angle - base.angle) > 1e-12 || Math.abs(movedThird.geometry.width - base.width) > 1e-9) throw new Error('Corner 3 changed the 1-2 baseline');

const handles = regionHandlePoints(base);
if (!handles.corner1 || !handles.corner2 || !handles.corner3 || Object.keys(handles).length !== 3) throw new Error('Expected exactly three corner handles');

const dualSide = { geometry: structuredClone(base), targetGeometry: structuredClone(base) };
const targetCorner = rotatedCorners(base)[2];
updateRegionFromHandle(dualSide, 'target', 'corner3', [targetCorner[0] + normal[0] * 30, targetCorner[1] + normal[1] * 30], base);
if (JSON.stringify(dualSide.geometry) !== JSON.stringify(base)) throw new Error('Target handle changed source geometry');
if (JSON.stringify(dualSide.targetGeometry) === JSON.stringify(base)) throw new Error('Target handle did not change target geometry');

const rotated = { custom: true, geometry: { center: [100, 100], width: 100, height: 30, angle: Math.PI / 4 } };
if (!insideRegion([100, 100], rotated)) throw new Error('Rectangle center should be inside');
if (insideRegion([140, 60], rotated)) throw new Error('Point outside rotated rectangle leaked through its AABB');
console.log('Region handles passed: independent overlap, three corners on both maps, affine mapping clipped to rotated interior');
