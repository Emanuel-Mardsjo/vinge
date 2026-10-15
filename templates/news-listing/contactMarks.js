/* Candidate marks for "contact", on the library's own terms: a 0 0 100 100
   viewBox, one path per part, a draw order and a travel axis. The paths
   live in components/core/markLibrary.jsx while under review; this file
   holds the labels and states; the chosen one moves into assets/marks.json and the rest are deleted.

   Each candidate carries four states that follow the subscribe form:
   idle (empty), typing (something entered), ready (can be sent), sent. Ready
   is the library mark at rest, so a sequence always ends on the mark itself. */
(() => {
  const D = 0.7071;
  const C = {
    'arcs-close': {
      label: 'Two halves', idea: 'Two half circles close into one. Contact as completion.',
      parts: [
        { part: 'arc-left', axis: [-1, 0], order: 0, d: 'M 50 20 A 30 30 0 0 0 50 80' },
        { part: 'arc-right', axis: [1, 0], order: 1, d: 'M 50 20 A 30 30 0 0 1 50 80' },
        { part: 'axis', axis: [0, 0], order: 2, d: 'M 50 8 L 50 92' },
      ],
      states: {
        idle: { move: { 'arc-left': 16, 'arc-right': 16 }, trim: { axis: 0 } },
        typing: { move: { 'arc-left': 7, 'arc-right': 7 }, trim: { axis: 0 } },
        ready: { trim: { axis: 0 } },
        sent: { draw: { part: 'axis', from: 0, to: 100, dur: 1400 } },
      },
    },
    'corners-hold': {
      label: 'Shared frame', idea: 'Two corners that only make a frame together. Contact as a space held by both.',
      parts: [
        { part: 'corner-top', axis: [-D, -D], order: 0, d: 'M 18 62 L 18 18 L 62 18' },
        { part: 'corner-bottom', axis: [D, D], order: 1, d: 'M 82 38 L 82 82 L 38 82' },
        { part: 'chord', axis: [0, 0], order: 2, d: 'M 32 68 L 68 32' },
      ],
      states: {
        idle: { move: { 'corner-top': 12, 'corner-bottom': 12 }, trim: { chord: 0 } },
        typing: { move: { 'corner-top': 5, 'corner-bottom': 5 }, trim: { chord: 0 } },
        ready: { trim: { chord: 0 } },
        sent: { draw: { part: 'chord', from: 0, to: 100, dur: 1400 } },
      },
    },
    'diamonds-tangent': {
      label: 'Point of contact', idea: 'Two mirrored diamonds that rest tip to tip and overlap once the form is being filled in.',
      parts: [
        { part: 'diamond-left', axis: [-1, 0], order: 0, d: 'M 26 26 L 50 50 L 26 74 L 2 50 Z' },
        { part: 'diamond-right', axis: [1, 0], order: 1, d: 'M 74 26 L 98 50 L 74 74 L 50 50 Z' },
      ],
      states: {
        idle: {},
        typing: { move: { 'diamond-left': -5, 'diamond-right': -5 } },
        ready: { move: { 'diamond-left': -9, 'diamond-right': -9 } },
        sent: { move: { 'diamond-left': -9, 'diamond-right': -9 }, draw: { part: 'diamond-right', from: 0, to: 100, dur: 1400 } },
      },
    },
    'lines-overlap': {
      label: 'Common ground', idea: 'Two lines from opposite sides that share a stretch, bridged where they overlap.',
      parts: [
        { part: 'line-top', axis: [-1, 0], order: 0, d: 'M 8 42 L 64 42' },
        { part: 'line-bottom', axis: [1, 0], order: 1, d: 'M 36 58 L 92 58' },
        { part: 'bridge', axis: [0, 0], order: 2, d: 'M 50 42 L 50 58' },
      ],
      states: {
        idle: { move: { 'line-top': 18, 'line-bottom': 18 }, trim: { bridge: 0 } },
        typing: { move: { 'line-top': 8, 'line-bottom': 8 }, trim: { bridge: 0 } },
        ready: { trim: { bridge: 0 } },
        sent: { draw: { part: 'bridge', from: 0, to: 100, dur: 1400 } },
      },
    },
    'square-circle': {
      label: 'Unlike parties', idea: 'A square and a circle, two different shapes, overlapping at one corner.',
      parts: [
        { part: 'square', axis: [-D, -D], order: 0, d: 'M 37 14 L 60 14 L 60 60 L 14 60 L 14 14 Z' },
        { part: 'circle', axis: [D, D], order: 1, d: 'M 62 38 A 24 24 0 0 1 62 86 A 24 24 0 0 1 62 38 Z' },
      ],
      states: {
        idle: { move: { square: 12, circle: 12 } },
        typing: { move: { square: 5, circle: 5 } },
        ready: {},
        sent: { draw: { part: 'circle', from: 0, to: 100, dur: 1400 } },
      },
    },
    'curves-join': {
      label: 'One line', idea: 'Two curves from opposite corners that meet and continue as a single line.',
      parts: [
        { part: 'curve-left', axis: [-1, 0], order: 0, d: 'M 10 86 C 10 62 26 50 50 50' },
        { part: 'curve-right', axis: [1, 0], order: 1, d: 'M 90 14 C 90 38 74 50 50 50' },
      ],
      states: {
        idle: { move: { 'curve-left': 14, 'curve-right': 14 } },
        typing: { move: { 'curve-left': 6, 'curve-right': 6 } },
        ready: {},
        sent: { draw: { part: 'curve-right', from: 0, to: 100, dur: 1400 } },
      },
    },
  };
  window.VingeContactMarks = C;
  const register = () => {
    const ns = window.VingeDesignSystem_8582c7;
    if (!ns || !ns.MARKS) return false;
    for (const k in C) if (!ns.MARKS[k]) return false;
    window.VingeContactMarksReady = true;
    window.dispatchEvent(new Event('vinge-contact-marks'));
    return true;
  };
  if (!register()) {
    const t = setInterval(() => { if (register()) clearInterval(t); }, 40);
  }
})();
