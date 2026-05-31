import { exportModelObject } from './export-model';
import type { ConversionInput, ConversionResult } from './conversion-types';

const fallbackBaseName = 'converted-model';

export function getConvertedFileName(fileName: string, targetFormat: ConversionInput['targetFormat'], scaleFactor?: number) {
  const trimmedName = fileName.trim();
  const lastSegment = trimmedName.split(/[\\/]/).filter(Boolean).pop() ?? '';
  const baseName = lastSegment.replace(/\.[^/.]+$/, '').trim() || fallbackBaseName;
  const scaleSuffix = scaleFactor && scaleFactor !== 1 ? `-scaled-${Math.round(scaleFactor * 100)}pct` : '';
  return `${baseName}${scaleSuffix}.${targetFormat}`;
}

function mimeTypeForFormat(format: ConversionInput['targetFormat']) {
  if (format === 'stl') return 'model/stl';
  if (format === 'obj') return 'text/plain';
  if (format === 'glb') return 'model/gltf-binary';
  return 'application/octet-stream';
}

export async function convertModel(input: ConversionInput): Promise<ConversionResult> {
  const blob = await exportModelObject(input.object, input.targetFormat, input.scaleFactor);
  const mimeType = mimeTypeForFormat(input.targetFormat);
  return {
    blob: blob.type ? blob : new Blob([blob], { type: mimeType }),
    fileName: getConvertedFileName(input.fileName, input.targetFormat, input.scaleFactor),
    mimeType,
  };
}
