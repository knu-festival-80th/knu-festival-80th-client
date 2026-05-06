import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Check, Pencil, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';

import { ApiClientError, boothApi, imagePathToSrc, imageUrlToPath, uploadApi } from '@/apis';
import type { BoothListItem, BoothUpdateRequest } from '@/apis';
import { useAuthStore } from '@/stores/authStore';

export default function BoothProfilePage() {
  const boothId = useAuthStore((s) => s.boothId);

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });

  if (boothId === null) return null;

  if (boothsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-[var(--admin-surface)]" />
        ))}
      </div>
    );
  }

  if (boothsQuery.isError) {
    return (
      <div className="rounded-2xl bg-[var(--admin-danger-soft)] px-4 py-3 text-sm text-[var(--admin-danger)]">
        {boothsQuery.error instanceof ApiClientError
          ? boothsQuery.error.message
          : '부스 정보를 불러오지 못했습니다.'}
      </div>
    );
  }

  const booth = boothsQuery.data?.find((b) => b.boothId === boothId);
  if (!booth) {
    return <p className="text-sm text-[var(--admin-text-faint)]">해당 부스를 찾을 수 없습니다.</p>;
  }

  return <BoothProfileView key={boothId} boothId={boothId} booth={booth} />;
}

interface BoothProfileViewProps {
  boothId: number;
  booth: BoothListItem;
}

function BoothProfileView({ boothId, booth }: BoothProfileViewProps) {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: BoothUpdateRequest) => boothApi.updateBooth(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
      setEditingField(null);
      showToast('success', '저장되었습니다.');
    },
    onError: (error: unknown) => {
      showToast('error', error instanceof ApiClientError ? error.message : '저장에 실패했습니다.');
    },
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = (field: string, value: string) => {
    const payload: BoothUpdateRequest = {};
    if (field === 'name') payload.name = value.trim() || undefined;
    else if (field === 'description') payload.description = value.trim();
    else if (field === 'xRatio') {
      const n = Number(value);
      if (value && (!Number.isFinite(n) || n < 0 || n > 1)) {
        showToast('error', '0과 1 사이의 값이어야 합니다.');
        return;
      }
      payload.xRatio = value ? n : undefined;
    } else if (field === 'yRatio') {
      const n = Number(value);
      if (value && (!Number.isFinite(n) || n < 0 || n > 1)) {
        showToast('error', '0과 1 사이의 값이어야 합니다.');
        return;
      }
      payload.yRatio = value ? n : undefined;
    }
    updateMutation.mutate(payload);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const result = await uploadApi.uploadImage(file);
      updateMutation.mutate({ menuBoardImageUrl: result.path });
    } catch {
      showToast('error', '이미지 업로드에 실패했습니다.');
    }
  };

  const menuBoardSrc = imagePathToSrc(imageUrlToPath(booth.menuBoardImageUrl));

  return (
    <div className="flex flex-col gap-3">
      {toast && (
        <div
          className={[
            'rounded-xl px-4 py-3 text-sm font-medium',
            toast.type === 'success'
              ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
              : 'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]',
          ].join(' ')}
        >
          {toast.message}
        </div>
      )}

      <div className="rounded-2xl bg-[var(--admin-surface)]">
        <InlineRow
          label="부스 이름"
          value={booth.name}
          editing={editingField === 'name'}
          editValue={editValue}
          onEdit={() => startEdit('name', booth.name)}
          onCancel={cancelEdit}
          onChange={setEditValue}
          onSave={() => saveField('name', editValue)}
          saving={updateMutation.isPending}
        />
        <div className="mx-4 border-t border-[var(--admin-border)]" />
        <InlineRow
          label="설명"
          value={booth.description || ''}
          placeholder="부스 소개를 입력하세요"
          editing={editingField === 'description'}
          editValue={editValue}
          onEdit={() => startEdit('description', booth.description ?? '')}
          onCancel={cancelEdit}
          onChange={setEditValue}
          onSave={() => saveField('description', editValue)}
          saving={updateMutation.isPending}
          multiline
        />
      </div>

      <div className="rounded-2xl bg-[var(--admin-surface)]">
        <div className="px-4 pt-4 pb-2">
          <span className="text-[13px] font-semibold text-[var(--admin-text-muted)]">
            위치 (지도 비율)
          </span>
        </div>
        <InlineRow
          label="X 좌표"
          value={booth.xRatio?.toString() ?? ''}
          placeholder="0.00"
          editing={editingField === 'xRatio'}
          editValue={editValue}
          onEdit={() => startEdit('xRatio', booth.xRatio?.toString() ?? '')}
          onCancel={cancelEdit}
          onChange={setEditValue}
          onSave={() => saveField('xRatio', editValue)}
          saving={updateMutation.isPending}
          inputMode="decimal"
        />
        <div className="mx-4 border-t border-[var(--admin-border)]" />
        <InlineRow
          label="Y 좌표"
          value={booth.yRatio?.toString() ?? ''}
          placeholder="0.00"
          editing={editingField === 'yRatio'}
          editValue={editValue}
          onEdit={() => startEdit('yRatio', booth.yRatio?.toString() ?? '')}
          onCancel={cancelEdit}
          onChange={setEditValue}
          onSave={() => saveField('yRatio', editValue)}
          saving={updateMutation.isPending}
          inputMode="decimal"
        />
      </div>

      <div className="rounded-2xl bg-[var(--admin-surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--admin-text-muted)]">
            메뉴판 이미지
          </span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-[13px] font-medium text-[var(--admin-primary)]"
          >
            <Camera size={14} />
            {menuBoardSrc ? '변경' : '업로드'}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleImageUpload}
        />
        {menuBoardSrc ? (
          <img
            src={menuBoardSrc}
            alt="메뉴판"
            className="w-full rounded-xl border border-[var(--admin-border)] object-contain"
            style={{ maxHeight: 320 }}
          />
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-[var(--admin-surface-hover)] text-sm text-[var(--admin-text-faint)]">
            메뉴판 사진을 업로드하세요
          </div>
        )}
      </div>
    </div>
  );
}

interface InlineRowProps {
  label: string;
  value: string;
  placeholder?: string;
  editing: boolean;
  editValue: string;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  multiline?: boolean;
  inputMode?: 'text' | 'decimal';
}

function InlineRow({
  label,
  value,
  placeholder,
  editing,
  editValue,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
  multiline,
  inputMode = 'text',
}: InlineRowProps) {
  if (editing) {
    return (
      <div className="flex flex-col gap-2 px-4 py-3">
        <span className="text-[13px] font-medium text-[var(--admin-text-muted)]">{label}</span>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-20 rounded-xl border-0 bg-[var(--admin-surface-hover)] px-3 py-2.5 text-[15px] text-[var(--admin-text)] outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
            autoFocus
          />
        ) : (
          <input
            type="text"
            inputMode={inputMode}
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 rounded-xl border-0 bg-[var(--admin-surface-hover)] px-3 text-[15px] text-[var(--admin-text)] outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
          />
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-primary)] text-white disabled:opacity-60"
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors active:bg-[var(--admin-surface-hover)]"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-[var(--admin-text-muted)]">{label}</span>
        <span
          className={[
            'text-[15px]',
            value ? 'text-[var(--admin-text)]' : 'text-[var(--admin-text-faint)]',
          ].join(' ')}
        >
          {value || placeholder || '미입력'}
        </span>
      </div>
      <Pencil size={14} className="shrink-0 text-[var(--admin-text-faint)]" />
    </button>
  );
}
