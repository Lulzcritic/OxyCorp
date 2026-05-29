import { type ReactNode } from 'react';

interface EditableAssetProps {
  id: string;
  children: ReactNode;
  position?: [number, number, number];
}

export function EditableAsset({ children, position }: EditableAssetProps) {
  return <group position={position}>{children}</group>;
}
