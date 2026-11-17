'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Upload,
} from 'lucide-react';
import ElementRenderer from './ElementRenderer';
import FloatingToolbar from './FloatingToolbar';
import { makeElement } from '@/lib/defaults';

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

const HANDLE_CURSOR = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

const MIN_SIZE = 16;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function Canvas({
  site,
  lang,
  selectedId,
  setSelectedId,
  updateElement,
  patchElement,
  addElement,
  deleteElement,
  duplicateElement,
  reorder,
  zoom,
  fitScale,
  languageOptions = [],
  defaultLang = 'en',
}) {
  const stageRef = useRef(null);
  const dragState = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [toolbarAnchor, setToolbarAnchor] = useState(null);
  const [dropActive, setDropActive] = useState(false);

  const elements = useMemo(() => site.elements || [], [site.elements]);
  const sorted = useMemo(() => elements.slice().sort((a, b) => (a.z || 1) - (b.z || 1)), [elements]);
  const selected = useMemo(() => elements.find((e) => e.id === selectedId) || null, [elements, selectedId]);

  const scale = zoom * fitScale;
  const canvasWidth = site.canvas?.width || 1280;
  const canvasHeight = useMemo(() => {
    const maxBottom = elements.reduce((acc, el) => Math.max(acc, (el.y || 0) + (el.h || 0)), 0);
    return Math.max(maxBottom, site.canvas?.minHeight || 900);
  }, [elements, site.canvas]);

  /* ---------------- pointer interactions ---------------- */

  const startDrag = useCallback(
    (e, el) => {
      if (e.button !== 0) return;
      const rect = stageRef.current.getBoundingClientRect();
      dragState.current = {
        mode: 'move',
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        rect,
        scale: rect.width / canvasWidth,
      };
      e.preventDefault();
    },
    [canvasWidth]
  );

  const startResize = useCallback(
    (e, el, dir) => {
      if (e.button !== 0) return;
      const rect = stageRef.current.getBoundingClientRect();
      dragState.current = {
        mode: 'resize',
        id: el.id,
        dir,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origW: el.w,
        origH: el.h,
        rect,
        scale: rect.width / canvasWidth,
      };
      e.preventDefault();
      e.stopPropagation();
    },
    [canvasWidth]
  );

  useEffect(() => {
    const onMove = (e) => {
      const st = dragState.current;
      if (!st) return;
      const dx = (e.clientX - st.startX) / st.scale;
      const dy = (e.clientY - st.startY) / st.scale;

      if (st.mode === 'move') {
        updateElement(st.id, { x: Math.round(st.origX + dx), y: Math.round(st.origY + dy) });
        return;
      }

      const d = st.dir;
      let { origX: x, origY: y, origW: w, origH: h } = st;
      if (d.includes('e')) w = Math.max(MIN_SIZE, st.origW + dx);
      if (d.includes('s')) h = Math.max(MIN_SIZE, st.origH + dy);
      if (d.includes('w')) {
        w = Math.max(MIN_SIZE, st.origW - dx);
        x = st.origX + (st.origW - w);
      }
      if (d.includes('n')) {
        h = Math.max(MIN_SIZE, st.origH - dy);
        y = st.origY + (st.origH - h);
      }
      updateElement(st.id, { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
    };

    const onUp = () => {
      dragState.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [updateElement]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (!selected) return;

      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteElement(selected.id);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateElement(selected.id);
        return;
      }
      const moves = {
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
      };
      if (moves[e.key]) {
        e.preventDefault();
        const [mx, my] = moves[e.key];
        updateElement(selected.id, { x: selected.x + mx, y: selected.y + my });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, deleteElement, duplicateElement, updateElement]);

  /* ---------------- floating toolbar anchor ---------------- */

  useEffect(() => {
    if (!selected) {
      setToolbarAnchor(null);
      return;
    }
    const compute = () => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const s = rect.width / canvasWidth;
      const x = rect.left + selected.x * s;
      const y = rect.top + (selected.y + selected.h) * s + 10;
      const rightX = rect.left + (selected.x + selected.w) * s + 14;
      const preferRight = rightX + 340 < window.innerWidth;
      setToolbarAnchor({
        x: preferRight ? rightX : x,
        y: Math.min(y, window.innerHeight - 260),
      });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [selected, canvasWidth]);

  /* ---------------- drop from the OS ---------------- */

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setDropActive(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (!files.length) return;
      const rect = stageRef.current.getBoundingClientRect();
      const s = rect.width / canvasWidth;
      const x = Math.max(0, Math.round((e.clientX - rect.left) / s));
      const y = Math.max(0, Math.round((e.clientY - rect.top) / s));

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const data = await readFileAsDataUrl(file);
        if (file.type.startsWith('image/')) {
          addElement(
            makeElement('image', {
              x,
              y,
              w: 300,
              h: 220,
              content: { src: data, alt: file.name },
              style: { radius: 12 },
            })
          );
        } else if (file.type.startsWith('video/')) {
          addElement(
            makeElement('section', {
              x: 0,
              y,
              w: canvasWidth,
              h: 520,
              z: 0,
              content: { videoUrl: data, bg: { type: 'color', color: '#000000', overlay: 0.45 } },
            })
          );
        }
      }
    },
    [addElement, canvasWidth]
  );

  const contextActions = [
    { label: 'Duplicate', icon: Copy, run: () => duplicateElement(contextMenu.id) },
    { label: 'Bring forward', icon: ArrowUp, run: () => reorder(contextMenu.id, 'forward') },
    { label: 'Send backward', icon: ArrowDown, run: () => reorder(contextMenu.id, 'backward') },
    {
      label: contextMenu?.hidden ? 'Show' : 'Hide',
      icon: contextMenu?.hidden ? Eye : EyeOff,
      run: () => patchElement(contextMenu.id, { hidden: !contextMenu.hidden }),
    },
    { label: 'Delete', icon: Trash2, run: () => deleteElement(contextMenu.id), danger: true },
  ];

  return (
    <div className="relative flex-1 overflow-auto bg-ink-100 p-6 scroll-thin" onMouseDown={() => {
      setSelectedId(null);
      setContextMenu(null);
    }}>
      <div
        className="mx-auto"
        style={{ width: canvasWidth * scale, height: canvasHeight * scale }}
      >
        <div
          ref={stageRef}
          className={`relative origin-top-left shadow-2xl ring-1 ring-ink-200 ${
            dropActive ? 'ring-2 ring-brand-500' : ''
          }`}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            background: site.canvas?.background || '#ffffff',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDropActive(true);
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={handleDrop}
        >
          {sorted.map((el) => {
            const isSelected = el.id === selectedId;
            return (
              <div
                key={el.id}
                data-el-id={el.id}
                data-el-type={el.type}
                className={`absolute ${el.hidden ? 'opacity-25' : ''}`}
                style={{ left: el.x, top: el.y, width: el.w, height: el.h, zIndex: el.z || 1 }}
                onPointerDown={(e) => {
                  if (el.type === 'section') return;
                  e.stopPropagation();
                  setSelectedId(el.id);
                  startDrag(e, el);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedId(el.id);
                  setContextMenu({ id: el.id, x: e.clientX, y: e.clientY, hidden: el.hidden });
                }}
              >
                <ElementRenderer el={el} lang={lang} />

                {/* Section hit layer so backgrounds remain clickable */}
                {el.type === 'section' ? (
                  <button
                    type="button"
                    aria-label="Select section"
                    className="absolute inset-0 cursor-pointer"
                    style={{ background: 'transparent' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedId(el.id);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedId(el.id);
                      setContextMenu({ id: el.id, x: e.clientX, y: e.clientY, hidden: el.hidden });
                    }}
                  />
                ) : null}

                {isSelected ? (
                  <>
                    <div className="pointer-events-none absolute -inset-px rounded-[3px] ring-2 ring-brand-500" />
                    {HANDLES.map((dir) => {
                      const pos = {
                        nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
                        n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
                        ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
                        e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
                        se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
                        s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2',
                        sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
                        w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
                      }[dir];
                      return (
                        <span
                          key={dir}
                          role="presentation"
                          onPointerDown={(e) => startResize(e, el, dir)}
                          className={`absolute z-20 h-2.5 w-2.5 rounded-sm border border-white bg-brand-600 shadow ${pos}`}
                          style={{ cursor: HANDLE_CURSOR[dir] }}
                        />
                      );
                    })}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right-click context menu */}
      {contextMenu ? (
        <div
          className="fixed z-50 w-52 animate-scale-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-2xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {contextActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                action.run();
                setContextMenu(null);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition ${
                action.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              <action.icon size={15} />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Floating contextual toolbar */}
      {selected && toolbarAnchor ? (
        <FloatingToolbar
          el={selected}
          anchor={toolbarAnchor}
          onChange={(patch) => updateElement(selected.id, patch)}
          onPatch={(patch) => patchElement(selected.id, patch)}
          onDelete={() => deleteElement(selected.id)}
          onDuplicate={() => duplicateElement(selected.id)}
          onBringForward={() => reorder(selected.id, 'forward')}
          onSendBackward={() => reorder(selected.id, 'backward')}
          onToggleHidden={() => patchElement(selected.id, { hidden: !selected.hidden })}
          onClose={() => setSelectedId(null)}
          languageOptions={languageOptions}
          defaultLang={defaultLang}
        />
      ) : null}

      {dropActive ? (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-brand-600/10">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-2xl">
            <Upload className="text-brand-600" size={22} />
            <span className="text-sm font-semibold text-ink-800">
              Drop your image or video to place it here
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
