const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const start = source.indexOf('  function rotatedCorners');
const end = source.indexOf('  function invalidRegionGeometry', start);
if (start < 0 || end < 0) throw new Error('Region geometry functions not found');

const factory = new Function('round3', `${source.slice(start, end)}\nreturn { regionHandlePoints, updateRegionFromHandle };`);
const { regionHandlePoints, updateRegionFromHandle } = factory(value => Number(value.toFixed(3)));
const base = { center: [100, 200], width: 80, height: 40, angle: Math.PI / 6 };

const centered = { geometry: structuredClone(base) };
updateRegionFromHandle(centered, 'center', [300, 400], base);
if (centered.geometry.center[0] !== 300 || centered.geometry.center[1] !== 400) throw new Error('Center handle did not move the rectangle');
if (centered.geometry.angle !== base.angle || centered.geometry.width !== base.width || centered.geometry.height !== base.height) throw new Error('Center handle changed rotation or size');

const widened = { geometry: structuredClone(base) };
updateRegionFromHandle(widened, 'width', [100, 260], base);
if (Math.abs(widened.geometry.angle - Math.PI / 2) > 1e-12) throw new Error('Width handle rotation is incorrect');
if (Math.abs(widened.geometry.width - 120) > 1e-12) throw new Error('Width handle size is incorrect');
if (widened.geometry.height !== base.height || widened.geometry.center[0] !== base.center[0] || widened.geometry.center[1] !== base.center[1]) throw new Error('Width handle changed center or height');

const heightened = { geometry: structuredClone(base) };
const normal = [-Math.sin(base.angle), Math.cos(base.angle)];
updateRegionFromHandle(heightened, 'height', [base.center[0] + normal[0] * 50, base.center[1] + normal[1] * 50], base);
if (Math.abs(heightened.geometry.height - 100) > 1e-9) throw new Error('Height handle size is incorrect');
if (heightened.geometry.angle !== base.angle || heightened.geometry.width !== base.width) throw new Error('Height handle changed rotation or width');

const handles = regionHandlePoints(base);
if (!handles.center || !handles.width || !handles.height || Object.keys(handles).length !== 3) throw new Error('Expected exactly three region handles');
console.log('Region handles passed: center-only movement, width-only rotation, height-only scaling, exactly three handles');
