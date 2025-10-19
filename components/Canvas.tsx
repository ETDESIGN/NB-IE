

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Annotation, Adjustments, SelectionMode, CropAspectRatio } from '../types';

interface CanvasProps {
  image: string | null;
  selectionMask: string | null;
  aspectRatio: string;
  annotations: Annotation[];
  onAddAnnotation: (x: number, y: number) => void;
  onUpdateAnnotationText: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onMaskChange: (maskDataUrl: string | null) => void;
  isDrawingEnabled: boolean;
  brushSize: number;
  retouchMode: 'replace' | 'erase';
  isCroppingEnabled: boolean;
  cropBox: { x: number; y: number; width: number; height: number; } | null;
  onCropBoxChange: (box: { x: number; y: number; width: number; height: number; } | null) => void;
  cropAspectRatio: CropAspectRatio;
  liveAdjustments: Adjustments;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  panOffset: { x: number, y: number };
  onPanChange: (pan: React.SetStateAction<{ x: number, y: number }>) => void;
  selectionMode: SelectionMode;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        if (!src || typeof src !== 'string' || !src.startsWith('data:image')) {
            return reject(new Error('Invalid image source.'));
        }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

const MASK_COLOR = 'rgba(138, 43, 226, 0.7)';
const HANDLE_SIZE = 10; // in pixels

const adjustmentsToCssFilter = (adjustments: Adjustments): string => {
    return `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%) 
      saturate(${adjustments.saturation}%)
      hue-rotate(${adjustments.hue}deg)
    `.trim();
};

// Fix: Pass an explicit `undefined` to `useRef`. The no-argument overload for `useRef` may not
// be available in older React type definitions, causing a "Expected 1 arguments, but got 0" error.
const usePrevious = <T,>(value: T) => {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

const PADDING_FACTOR = 0.95;


export const Canvas: React.FC<CanvasProps> = ({ 
    image, 
    selectionMask, 
    aspectRatio, 
    annotations, 
    onAddAnnotation, 
    onUpdateAnnotationText, 
    onDeleteAnnotation,
    onMaskChange,
    isDrawingEnabled,
    brushSize,
    retouchMode,
    isCroppingEnabled,
    cropBox,
    onCropBoxChange,
    cropAspectRatio,
    liveAdjustments,
    zoomLevel,
    onZoomChange,
    panOffset,
    onPanChange,
    selectionMode,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const lassoPoints = useRef<{x: number, y: number}[]>([]);

    const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({ display: 'none' });
    
    // State for cropping interaction
    const [cropCursor, setCropCursor] = useState('default');
    const [dragInfo, setDragInfo] = useState<{
        startMouseX: number;
        startMouseY: number;
        startBox: { x: number; y: number; width: number; height: number; };
        handle: string;
    } | null>(null);

    // State for panning
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const isPanning = useRef(false);
    const lastPanPos = useRef({ x: 0, y: 0 });
    const prevImage = usePrevious(image);


    // --- NEW: Refs and effects for annotation auto-focus ---
    const annotationInputsRef = useRef<Map<string, HTMLInputElement | null>>(new Map());
    const prevAnnotationsLength = usePrevious(annotations.length);

    useEffect(() => {
        // When a new annotation is added, focus its input field automatically.
        if (prevAnnotationsLength !== undefined && annotations.length > prevAnnotationsLength) {
            const newAnnotation = annotations[annotations.length - 1];
            if (newAnnotation) {
                const input = annotationInputsRef.current.get(newAnnotation.id);
                input?.focus();
            }
        }
    }, [annotations, prevAnnotationsLength]);


     useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputFocused =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (e.code === 'Space' && !e.repeat && !isInputFocused) {
                e.preventDefault();
                setIsSpacePressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Effect for drawing the main image and resizing/centering canvases
    useEffect(() => {
        const canvas = canvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        const container = containerRef.current;
        if (!canvas || !drawingCanvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleImageChange = async () => {
            try {
                if (!image) {
                    const [widthRatio, heightRatio] = aspectRatio.split('/').map(s => parseFloat(s.trim()));
                    const w = 512;
                    const h = heightRatio ? (w / widthRatio) * heightRatio : 512;
                    setCanvasSize({ width: w, height: h });
                    canvas.width = w; canvas.height = h;
                    drawingCanvas.width = w; drawingCanvas.height = h;
                    ctx.clearRect(0, 0, w, h);
                    ctx.fillStyle = '#A0A0A0';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '16px sans-serif';
                    ctx.fillText('Canvas is ready. Generate or upload an image.', w / 2, h / 2);

                    const { width: cW, height: cH } = container.getBoundingClientRect();
                    const scale = Math.min(cW / w, cH / h, 1) * PADDING_FACTOR;
                    onZoomChange(scale);
                    onPanChange({ x: (cW - w * scale) / 2, y: (cH - h * scale) / 2 });
                    return;
                }

                const mainImage = await loadImage(image);
                const { naturalWidth, naturalHeight } = mainImage;

                setCanvasSize({ width: naturalWidth, height: naturalHeight });
                canvas.width = naturalWidth; canvas.height = naturalHeight;
                drawingCanvas.width = naturalWidth; drawingCanvas.height = naturalHeight;
                ctx.clearRect(0, 0, naturalWidth, naturalHeight);
                ctx.drawImage(mainImage, 0, 0, naturalWidth, naturalHeight);

                const { width: cW, height: cH } = container.getBoundingClientRect();
                if (cW === 0 || cH === 0) return; // Guard against unmeasured container
                
                const scaleX = cW / naturalWidth;
                const scaleY = cH / naturalHeight;
                const newZoom = Math.min(scaleX, scaleY, 1) * PADDING_FACTOR;
                onZoomChange(newZoom);
                onPanChange({ x: (cW - naturalWidth * newZoom) / 2, y: (cH - naturalHeight * newZoom) / 2 });

            } catch (error) {
                 console.error("Canvas rendering failed:", error);
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
                 ctx.fillStyle = 'red';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.font = 'bold 16px sans-serif';
                 ctx.fillText('Error: Could not render image.', canvas.width / 2, canvas.height / 2);
            }
        };

        if (image !== prevImage) {
            handleImageChange();
        }
    }, [image, prevImage, aspectRatio, onPanChange, onZoomChange]);

    // Effect to sync the external selectionMask (white mask) to our drawable canvas (purple mask)
    useEffect(() => {
        const canvas = drawingCanvasRef.current;
        if (!canvas || !canvas.width || !canvas.height) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (selectionMask) {
            const maskImg = new Image();
            maskImg.onload = () => {
                // Draw the white mask image
                ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
                // Use globalCompositeOperation to 'colorize' the white mask with purple
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = MASK_COLOR;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Reset composite operation for future drawing
                ctx.globalCompositeOperation = 'source-over';
            };
            maskImg.src = selectionMask;
        }
    }, [selectionMask, canvasSize]);

    const getCoords = (e: React.MouseEvent<HTMLDivElement>): { x: number; y: number } | null => {
        const container = containerRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const canvasX = (mouseX - panOffset.x) / zoomLevel;
        const canvasY = (mouseY - panOffset.y) / zoomLevel;
        
        return { x: canvasX, y: canvasY };
    };

    const handleDrawingMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingEnabled || annotations.length > 0 || !(selectionMode === 'brush' || selectionMode === 'lasso')) return;
        isDrawing.current = true;
        
        const coords = getCoords(e);
        if (!coords) return;
        lastPos.current = coords;

        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        if (selectionMode === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.fillStyle = MASK_COLOR;
            ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (selectionMode === 'lasso') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            onMaskChange(null);
            lassoPoints.current = [coords];
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
    };
    
    const draw = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing.current || !isDrawingEnabled || annotations.length > 0) return;
        
        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const pos = getCoords(e);
        if (!ctx || !pos) return;
        
        if (selectionMode === 'brush' && lastPos.current) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.strokeStyle = MASK_COLOR;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (selectionMode === 'lasso') {
            lassoPoints.current.push(pos);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = MASK_COLOR;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        lastPos.current = pos;
    };
    
    const handleMouseUp = () => {
        if (isPanning.current) {
            isPanning.current = false;
        }

        if (isDrawing.current && isDrawingEnabled) {
            const canvas = drawingCanvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (selectionMode === 'lasso' && lassoPoints.current.length > 2 && ctx) {
                ctx.closePath();
                ctx.fillStyle = MASK_COLOR;
                ctx.fill();
            }

            isDrawing.current = false;
            lastPos.current = null;
            lassoPoints.current = [];
            
            if (canvas) {
                const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
                const isEmpty = !pixelBuffer.some(color => color !== 0);
                
                if (isEmpty) {
                    onMaskChange(null);
                } else {
                    const maskCanvas = document.createElement('canvas');
                    maskCanvas.width = canvas.width;
                    maskCanvas.height = canvas.height;
                    const maskCtx = maskCanvas.getContext('2d');
                    if (!maskCtx) {
                         onMaskChange(null);
                         return;
                    }
                    
                    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const maskData = maskCtx.createImageData(canvas.width, canvas.height);

                    for (let i = 0; i < originalData.data.length; i += 4) {
                        const alpha = originalData.data[i + 3];
                        if (alpha > 0) {
                            maskData.data[i] = 255;
                            maskData.data[i + 1] = 255;
                            maskData.data[i + 2] = 255;
                            maskData.data[i + 3] = alpha;
                        }
                    }
                    maskCtx.putImageData(maskData, 0, 0);
                    onMaskChange(maskCanvas.toDataURL('image/png'));
                }
            }
        }
    
        if (dragInfo) {
            handleCropMouseUp();
        }
    };


    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!image || isDrawingEnabled || isCroppingEnabled || isSpacePressed) return;
        
        const coords = getCoords(event);
        if (!coords) return;
        
        const relativeX = coords.x / canvasSize.width;
        const relativeY = coords.y / canvasSize.height;

        if (relativeX >= 0 && relativeX <= 1 && relativeY >= 0 && relativeY <= 1) {
            onAddAnnotation(relativeX, relativeY);
        }
    };

    const updateCursor = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container || !isDrawingEnabled || !image || selectionMode !== 'brush') {
            setCursorStyle({ display: 'none' });
            return;
        }

        const rect = container.getBoundingClientRect();
        const displayBrushSize = brushSize * zoomLevel;

        setCursorStyle({
            display: 'block',
            left: `${e.clientX - rect.left}px`,
            top: `${e.clientY - rect.top}px`,
            width: `${displayBrushSize}px`,
            height: `${displayBrushSize}px`,
            transform: 'translate(-50%, -50%)',
            borderColor: retouchMode === 'erase' ? '#EF4444' : 'white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.3)',
        });
    };
    
    const handleMouseLeave = () => {
        setCursorStyle({ display: 'none' });
        if (isDrawing.current) handleMouseUp();
        if (isPanning.current) isPanning.current = false;
        if (dragInfo) handleCropMouseUp();
    };

    // --- CROP LOGIC ---
    const getNumericRatio = (ratio: CropAspectRatio, imageWidth: number, imageHeight: number): number | null => {
        if (!imageWidth || !imageHeight) return null;
        if (ratio === 'free') return null;
        if (ratio === 'original') return imageWidth / imageHeight;
        const [w, h] = ratio.split(':').map(Number);
        return w / h;
    };
    
    const getHandleAt = (mousePos: { x: number; y: number }, box: { x: number; y: number; width: number; height: number; }, imgWidth: number, imgHeight: number) => {
        const handleThreshold = HANDLE_SIZE / zoomLevel;
        const corners = {
            tl: { x: box.x * imgWidth, y: box.y * imgHeight }, 
            tr: { x: (box.x + box.width) * imgWidth, y: box.y * imgHeight },
            bl: { x: box.x * imgWidth, y: (box.y + box.height) * imgHeight }, 
            br: { x: (box.x + box.width) * imgWidth, y: (box.y + box.height) * imgHeight }
        };
        for (const [key, pos] of Object.entries(corners)) {
            if (Math.abs(mousePos.x - pos.x) < handleThreshold && Math.abs(mousePos.y - pos.y) < handleThreshold) return key;
        }

        if (Math.abs(mousePos.x - box.x * imgWidth) < handleThreshold && mousePos.y > box.y * imgHeight && mousePos.y < (box.y + box.height) * imgHeight) return 'l';
        if (Math.abs(mousePos.x - (box.x + box.width) * imgWidth) < handleThreshold && mousePos.y > box.y * imgHeight && mousePos.y < (box.y + box.height) * imgHeight) return 'r';
        if (Math.abs(mousePos.y - box.y * imgHeight) < handleThreshold && mousePos.x > box.x * imgWidth && mousePos.x < (box.x + box.width) * imgWidth) return 't';
        if (Math.abs(mousePos.y - (box.y + box.height) * imgHeight) < handleThreshold && mousePos.x > box.x * imgWidth && mousePos.x < (box.x + box.width) * imgWidth) return 'b';
        if (mousePos.x > box.x * imgWidth && mousePos.x < (box.x + box.width) * imgWidth && mousePos.y > box.y * imgHeight && mousePos.y < (box.y + box.height) * imgHeight) return 'move';
        return null;
    };

    const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCroppingEnabled || !cropBox || !canvasRef.current) return;
        const coords = getCoords(e);
        if (!coords) return;
        const handle = getHandleAt(coords, cropBox, canvasSize.width, canvasSize.height);
        if (handle) {
            e.preventDefault();
            e.stopPropagation();
            setDragInfo({ startMouseX: coords.x, startMouseY: coords.y, startBox: { ...cropBox }, handle });
        }
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCroppingEnabled || !cropBox || !canvasRef.current) return;
        const coords = getCoords(e);
        if (!coords) return;
        
        const numericRatio = getNumericRatio(cropAspectRatio, canvasSize.width, canvasSize.height);

        if (dragInfo) {
            const dx = (coords.x - dragInfo.startMouseX) / canvasSize.width;
            const dy = (coords.y - dragInfo.startMouseY) / canvasSize.height;
            let { x, y, width, height } = dragInfo.startBox;
            const minSize = 0.05;

            if (!numericRatio) { // Freeform
                switch (dragInfo.handle) {
                    case 'tl': x += dx; y += dy; width -= dx; height -= dy; break;
                    case 't': y += dy; height -= dy; break;
                    case 'tr': y += dy; width += dx; height -= dy; break;
                    case 'l': x += dx; width -= dx; break;
                    case 'r': width += dx; break;
                    case 'bl': x += dx; width -= dx; height += dy; break;
                    case 'b': height += dy; break;
                    case 'br': width += dx; height += dy; break;
                    case 'move': x += dx; y += dy; break;
                }
            } else { // Constrained aspect ratio
                const startRight = dragInfo.startBox.x + dragInfo.startBox.width;
                const startBottom = dragInfo.startBox.y + dragInfo.startBox.height;

                switch (dragInfo.handle) {
                    case 'br': {
                        let newWidth = startRight + dx - x;
                        let newHeight = startBottom + dy - y;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        width = newWidth; height = newHeight;
                        break;
                    }
                    case 'tl': {
                        let newWidth = width - dx;
                        let newHeight = height - dy;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        x = startRight - newWidth; y = startBottom - newHeight; width = newWidth; height = newHeight;
                        break;
                    }
                    case 'tr': {
                        let newWidth = width + dx;
                        let newHeight = height - dy;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        y = startBottom - newHeight; width = newWidth; height = newHeight;
                        break;
                    }
                     case 'bl': {
                        let newWidth = width - dx;
                        let newHeight = height + dy;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        x = startRight - newWidth; width = newWidth; height = newHeight;
                        break;
                    }
                    case 'r': {
                        width += dx;
                        const newH = width / numericRatio;
                        y += (height - newH) / 2;
                        height = newH;
                        break;
                    }
                    case 'l': {
                        const newW = width - dx;
                        x += dx;
                        const newH = newW / numericRatio;
                        y += (height - newH) / 2;
                        width = newW;
                        height = newH;
                        break;
                    }
                    case 'b': {
                        height += dy;
                        const newW = height * numericRatio;
                        x += (width - newW) / 2;
                        width = newW;
                        break;
                    }
                    case 't': {
                        const newH = height - dy;
                        y += dy;
                        const newW = newH * numericRatio;
                        x += (width - newW) / 2;
                        width = newW;
                        height = newH;
                        break;
                    }
                    case 'move':
                        x += dx; y += dy;
                        break;
                }
            }

            // Clamp and update
            if (width < 0) { const oldX = x; x = oldX + width; width = -width; }
            if (height < 0) { const oldY = y; y = oldY + height; height = -height; }
            if (width < minSize) width = minSize;
            if (height < minSize) height = minSize;
            if (x < 0) { width += x; x = 0; }
            if (y < 0) { height += y; y = 0; }
            if (x + width > 1) width = 1 - x;
            if (y + height > 1) height = 1 - y;

            onCropBoxChange({ x, y, width, height });
        } else {
            const handle = getHandleAt(coords, cropBox, canvasSize.width, canvasSize.height);
            const cursors: { [key: string]: string } = { tl: 'nwse-resize', t: 'ns-resize', tr: 'nesw-resize', l: 'ew-resize', r: 'ew-resize', bl: 'nesw-resize', b: 'ns-resize', br: 'nwse-resize', move: 'move' };
            setCropCursor(handle ? cursors[handle] : 'default');
        }
    };

    const handleCropMouseUp = () => {
        setDragInfo(null);
    };

    // --- ZOOM & PAN ---
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!image) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mousePointX = (mouseX - panOffset.x) / zoomLevel;
        const mousePointY = (mouseY - panOffset.y) / zoomLevel;

        const zoomFactor = 1.1;
        const newZoom = e.deltaY < 0 ? zoomLevel * zoomFactor : zoomLevel / zoomFactor;
        const clampedZoom = Math.max(0.1, Math.min(newZoom, 10));

        if (clampedZoom === zoomLevel) {
            return;
        }

        const newPanX = mouseX - mousePointX * clampedZoom;
        const newPanY = mouseY - mousePointY * clampedZoom;
        
        onZoomChange(clampedZoom);
        onPanChange({ x: newPanX, y: newPanY });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isSpacePressed) {
            e.preventDefault();
            isPanning.current = true;
            lastPanPos.current = { x: e.clientX, y: e.clientY };
            return;
        }
        if (isDrawingEnabled) handleDrawingMouseDown(e);
        if (isCroppingEnabled) handleCropMouseDown(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning.current) {
            const dx = e.clientX - lastPanPos.current.x;
            const dy = e.clientY - lastPanPos.current.y;
            lastPanPos.current = { x: e.clientX, y: e.clientY };
            onPanChange(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            return;
        }
        updateCursor(e);
        if (isDrawingEnabled) draw(e);
        if (isCroppingEnabled) handleCropMouseMove(e);
    };

    const imageExists = !!image;
    let effectiveCursor = 'default';
    if (isPanning.current) {
        effectiveCursor = 'grabbing';
    } else if (isSpacePressed) {
        effectiveCursor = 'grab';
    } else if (isDrawingEnabled && imageExists) {
        if (selectionMode === 'brush') {
            effectiveCursor = 'none';
        } else if (selectionMode === 'lasso') {
            effectiveCursor = 'crosshair';
        } else { // ai_select
            effectiveCursor = 'default';
        }
    } else if (isCroppingEnabled) {
        effectiveCursor = cropCursor;
    } else if (imageExists) {
        effectiveCursor = 'crosshair';
    }


    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden bg-black/20"
            style={{ cursor: effectiveCursor }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
        >
             <div
                className="absolute rounded-lg overflow-hidden"
                style={{
                    left: `${panOffset.x}px`,
                    top: `${panOffset.y}px`,
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    willChange: 'transform, top, left',
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{
                        filter: adjustmentsToCssFilter(liveAdjustments),
                        imageRendering: zoomLevel > 2 ? 'pixelated' : 'auto',
                        display: 'block',
                    }}
                />
                <canvas
                    ref={drawingCanvasRef}
                    className="absolute top-0 left-0 opacity-70 pointer-events-none w-full h-full"
                />

                {isCroppingEnabled && cropBox && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-black/50" style={{
                            clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropBox.x * 100}% ${cropBox.y * 100}%, ${cropBox.x * 100}% ${(cropBox.y + cropBox.height) * 100}%, ${(cropBox.x + cropBox.width) * 100}% ${(cropBox.y + cropBox.height) * 100}%, ${(cropBox.x + cropBox.width) * 100}% ${cropBox.y * 100}%, ${cropBox.x * 100}% ${cropBox.y * 100}%)`
                        }}/>
                        <div className="absolute border-2 border-white pointer-events-auto" style={{
                            left: `${cropBox.x * 100}%`,
                            top: `${cropBox.y * 100}%`,
                            width: `${cropBox.width * 100}%`,
                            height: `${cropBox.height * 100}%`,
                        }}>
                             {/* Rule of thirds grid lines */}
                             <div className="absolute top-0 left-1/3 w-px h-full bg-white/50"></div>
                             <div className="absolute top-0 left-2/3 w-px h-full bg-white/50"></div>
                             <div className="absolute top-1/3 left-0 w-full h-px bg-white/50"></div>
                             <div className="absolute top-2/3 left-0 w-full h-px bg-white/50"></div>

                             {['tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'].map(handle => {
                                let style: React.CSSProperties = {};
                                const offset = -HANDLE_SIZE / 2;
                                if (handle.includes('t')) style.top = offset;
                                if (handle.includes('b')) style.bottom = offset;
                                if (handle.includes('l')) style.left = offset;
                                if (handle.includes('r')) style.right = offset;
                                if (handle.length === 1 && (handle === 't' || handle === 'b')) { style.left = `calc(50% - ${HANDLE_SIZE / 2}px)`; }
                                if (handle.length === 1 && (handle === 'l' || handle === 'r')) { style.top = `calc(50% - ${HANDLE_SIZE / 2}px)`; }
                                return <div key={handle} className="absolute bg-white rounded-full" style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, ...style }} />;
                            })}
                        </div>
                    </div>
                )}
                 {annotations.map(anno => (
                    <div key={anno.id} className="absolute" style={{ left: `${anno.x * 100}%`, top: `${anno.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="relative group">
                            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface p-2 rounded-lg w-48 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <input
                                    ref={el => { annotationInputsRef.current.set(anno.id, el); }}
                                    type="text"
                                    value={anno.text}
                                    onChange={(e) => onUpdateAnnotationText(anno.id, e.target.value)}
                                    placeholder="Add note..."
                                    className="w-full bg-surface-light text-text-light text-xs p-1 rounded focus:ring-primary focus:border-primary border-none"
                                />
                                <button onClick={() => onDeleteAnnotation(anno.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs">&times;</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div
                className="absolute top-0 left-0 rounded-full border-2 bg-transparent pointer-events-none"
                style={{ ...cursorStyle }}
            />
        </div>
    );
};