import { ImageIcon, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react';

import { ApiClientError, imagePathToSrc, uploadApi } from '@/apis';

import Button from './Button';
import Field from './Field';

interface ImageUploadFieldProps {
  label: string;
  /** path 또는 URL. 빈 문자열이면 비어있음으로 간주. */
  value: string;
  /** 업로드 완료 시 path 를, 제거 시 빈 문자열을 전달. */
  onChange: (next: string) => void;
  hint?: ReactNode;
  required?: boolean;
  emptyMessage?: ReactNode;
  previewClassName?: string;
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

export default function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  required,
  emptyMessage = '이미지를 업로드하면 여기 미리보기가 표시됩니다.',
  previewClassName = 'h-32 w-full max-w-sm object-cover',
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = imagePathToSrc(value);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      onChange(result.path);
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : '이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setError(null);
    onChange('');
  };

  return (
    <Field label={label} hint={hint} required={required} error={error} htmlFor={inputId}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleSelect}
      />

      {previewSrc ? (
        <div className="flex flex-col gap-3">
          <img
            src={previewSrc}
            alt={`${label} 미리보기`}
            className={[
              'rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-hover)]',
              previewClassName,
            ].join(' ')}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openPicker}
              disabled={uploading}
              iconLeft={<RefreshCw size={14} />}
            >
              {uploading ? '업로드 중…' : '이미지 변경'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={uploading}
              iconLeft={<Trash2 size={14} />}
            >
              제거
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className={[
              'flex h-32 w-full max-w-sm flex-col items-center justify-center gap-2',
              'rounded-md border border-dashed border-[var(--admin-border-strong)]',
              'bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]',
              'transition-colors hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]',
              'disabled:cursor-not-allowed disabled:opacity-60',
            ].join(' ')}
          >
            {uploading ? (
              <>
                <RefreshCw size={28} className="animate-spin" />
                <span className="text-xs">업로드 중…</span>
              </>
            ) : (
              <>
                <ImageIcon size={28} />
                <span className="text-xs">{emptyMessage}</span>
              </>
            )}
          </button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openPicker}
            disabled={uploading}
            iconLeft={<Upload size={14} />}
          >
            {uploading ? '업로드 중…' : '이미지 업로드'}
          </Button>
        </div>
      )}
    </Field>
  );
}
