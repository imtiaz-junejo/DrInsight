export const RTE_IMAGE_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

const CORNER_HANDLES = new Set(["nw", "ne", "se", "sw"]);
const MIN_IMAGE_WIDTH = 80;
const MIN_IMAGE_HEIGHT = 60;

function clamp(value: number, min: number, max?: number) {
  const bounded = Math.max(min, value);
  return max !== undefined ? Math.min(bounded, max) : bounded;
}

export function addImageHandles(wrap: HTMLElement) {
  RTE_IMAGE_HANDLES.forEach((handle) => {
    if (wrap.querySelector(`[data-handle="${handle}"]`)) return;
    const span = document.createElement("span");
    span.className = `rte-image-handle rte-image-handle-${handle}`;
    span.dataset.handle = handle;
    wrap.appendChild(span);
  });
}

export function wrapBareImages(editor: HTMLElement) {
  editor.querySelectorAll("img").forEach((img) => {
    if (img.closest(".rte-image-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "rte-image-wrap";
    wrap.contentEditable = "false";
    wrap.dataset.rteImage = "1";
    const parent = img.parentNode;
    if (!parent) return;
    parent.insertBefore(wrap, img);
    wrap.appendChild(img);
    if (!img.style.width) img.style.width = "480px";
    if (!img.style.height) img.style.height = "auto";
    img.style.display = "block";
    img.style.maxWidth = "100%";
    img.draggable = false;
    addImageHandles(wrap);
  });
}

export function createImageWrap(url: string, width = 480): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = "rte-image-wrap";
  wrap.contentEditable = "false";
  wrap.dataset.rteImage = "1";

  const img = document.createElement("img");
  img.src = url;
  img.alt = "";
  img.draggable = false;
  img.style.width = `${width}px`;
  img.style.height = "auto";
  img.style.display = "block";
  img.style.maxWidth = "100%";
  wrap.appendChild(img);
  addImageHandles(wrap);
  return wrap;
}

export function computeImageSize(
  handle: string,
  startW: number,
  startH: number,
  dx: number,
  dy: number,
  maxW: number,
): { width: number; height: number } {
  if (handle === "e") {
    return { width: clamp(startW + dx, MIN_IMAGE_WIDTH, maxW), height: startH };
  }

  if (handle === "w") {
    return { width: clamp(startW - dx, MIN_IMAGE_WIDTH, maxW), height: startH };
  }

  if (handle === "s") {
    return { width: startW, height: clamp(startH + dy, MIN_IMAGE_HEIGHT) };
  }

  if (handle === "n") {
    return { width: startW, height: clamp(startH - dy, MIN_IMAGE_HEIGHT) };
  }

  if (CORNER_HANDLES.has(handle)) {
    let deltaW = 0;
    let deltaH = 0;

    if (handle === "se") {
      deltaW = dx;
      deltaH = dy;
    } else if (handle === "sw") {
      deltaW = -dx;
      deltaH = dy;
    } else if (handle === "ne") {
      deltaW = dx;
      deltaH = -dy;
    } else if (handle === "nw") {
      deltaW = -dx;
      deltaH = -dy;
    }

    const candidateW = startW + deltaW;
    const candidateH = startH + deltaH;
    const scaleW = candidateW / startW;
    const scaleH = candidateH / startH;
    const scale =
      scaleW < 1 || scaleH < 1 ? Math.min(scaleW, scaleH) : Math.max(scaleW, scaleH);

    return {
      width: clamp(startW * scale, MIN_IMAGE_WIDTH, maxW),
      height: clamp(startH * scale, MIN_IMAGE_HEIGHT),
    };
  }

  return { width: startW, height: startH };
}

export function attachImageInteractions(
  editor: HTMLElement,
  onChange: () => void,
): () => void {
  let resizing: {
    img: HTMLImageElement;
    handle: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    maxW: number;
  } | null = null;

  const deselectAll = () => {
    editor.querySelectorAll(".rte-image-wrap.selected").forEach((el) => el.classList.remove("selected"));
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest(".rte-image-handle")) return;

    const wrap = target.closest(".rte-image-wrap");
    if (wrap && editor.contains(wrap)) {
      event.preventDefault();
      deselectAll();
      wrap.classList.add("selected");
      return;
    }

    deselectAll();
  };

  const onMouseDown = (event: MouseEvent) => {
    const handle = (event.target as HTMLElement).closest(".rte-image-handle") as HTMLElement | null;
    if (!handle) return;

    event.preventDefault();
    event.stopPropagation();

    const wrap = handle.closest(".rte-image-wrap");
    const img = wrap?.querySelector("img") as HTMLImageElement | null;
    if (!wrap || !img) return;

    deselectAll();
    wrap.classList.add("selected");

    const rect = img.getBoundingClientRect();
    const startW = rect.width;
    const startH = rect.height;

    img.style.width = `${Math.round(startW)}px`;
    img.style.height = `${Math.round(startH)}px`;
    img.style.maxWidth = "100%";

    resizing = {
      img,
      handle: handle.dataset.handle ?? "se",
      startX: event.clientX,
      startY: event.clientY,
      startW,
      startH,
      maxW: editor.clientWidth - 24,
    };
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!resizing) return;

    const dx = event.clientX - resizing.startX;
    const dy = event.clientY - resizing.startY;
    const { width, height } = computeImageSize(
      resizing.handle,
      resizing.startW,
      resizing.startH,
      dx,
      dy,
      resizing.maxW,
    );

    resizing.img.style.width = `${Math.round(width)}px`;
    resizing.img.style.height = `${Math.round(height)}px`;
  };

  const onMouseUp = () => {
    if (!resizing) return;
    resizing = null;
    onChange();
  };

  editor.addEventListener("click", onClick);
  editor.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  return () => {
    editor.removeEventListener("click", onClick);
    editor.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };
}
