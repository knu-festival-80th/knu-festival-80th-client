import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Beer, Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, authApi, boothApi } from '@/apis';
import type { BoothListItem } from '@/apis';
import { Button, Field, Input } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

function boothLabel(booth: BoothListItem): string {
  const department = booth.department?.trim();
  return department ? `${booth.name} · ${department}` : booth.name;
}

function sortBooths(booths: BoothListItem[]): BoothListItem[] {
  return [...booths].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export default function BoothManageLoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [selectedBoothId, setSelectedBoothId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const boothsQuery = useQuery({
    queryKey: ['booths', 'public', { sort: 'likes' }],
    queryFn: () => boothApi.listBooths('likes'),
    staleTime: 60_000,
  });

  const sortedBooths = useMemo(
    () => (boothsQuery.data ? sortBooths(boothsQuery.data) : []),
    [boothsQuery.data],
  );

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.role === 'BOOTH_ADMIN' && response.boothId !== null) {
        setSession(response.role, response.boothId);
        navigate('/booth/manage', { replace: true });
        return;
      }
      setErrorMessage('계정 정보가 올바르지 않습니다. 운영진에게 문의해 주세요.');
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.message
          : '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = Number(selectedBoothId);
    if (!selectedBoothId || !Number.isInteger(parsed) || parsed <= 0) {
      setErrorMessage('주막을 선택해 주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }

    loginMutation.mutate({ boothId: parsed, password });
  };

  const isInvalid = Boolean(errorMessage);
  const boothsLoading = boothsQuery.isLoading;
  const boothsError = boothsQuery.isError;

  return (
    <div
      data-admin-theme="booth"
      className="flex min-h-dvh items-center justify-center bg-[var(--admin-bg)] px-5 py-8"
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)]">
            <Beer size={28} className="text-[var(--admin-primary)]" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="font-wanted-sans text-[22px] font-bold text-[var(--admin-text)]">
              주막 운영
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
              주막을 선택하고 비밀번호로 로그인
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="주막 선택" htmlFor="booth-select">
            <BoothSelect
              booths={sortedBooths}
              value={selectedBoothId}
              onChange={setSelectedBoothId}
              disabled={boothsLoading || boothsError || loginMutation.isPending}
              isInvalid={isInvalid}
              placeholder={
                boothsLoading
                  ? '주막 목록 불러오는 중...'
                  : boothsError
                    ? '목록을 불러오지 못했어요'
                    : '주막을 선택하세요'
              }
            />
          </Field>

          <Field label="비밀번호" htmlFor="booth-password">
            <Input
              id="booth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loginMutation.isPending || !selectedBoothId}
              invalid={isInvalid}
              placeholder={selectedBoothId ? '비밀번호 입력' : '주막을 먼저 선택하세요'}
            />
          </Field>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-[var(--admin-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--admin-danger)]"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            block
            disabled={loginMutation.isPending || !selectedBoothId || boothsLoading}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}

interface BoothSelectProps {
  booths: BoothListItem[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isInvalid?: boolean;
  placeholder?: string;
}

function BoothSelect({
  booths,
  value,
  onChange,
  disabled,
  isInvalid,
  placeholder,
}: BoothSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = booths.find((b) => String(b.boothId) === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && value) {
      const active = listRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
  }, [open, value]);

  const listboxId = 'booth-select-listbox';

  return (
    <div ref={containerRef} className="relative">
      <button
        id="booth-select"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={[
          'flex h-11 w-full items-center rounded-xl bg-[var(--admin-surface)] px-3.5 text-left text-[15px] outline-none transition-colors',
          'ring-1 focus:ring-2 focus:ring-[var(--admin-primary)]',
          isInvalid ? 'ring-[var(--admin-danger)]' : 'ring-[var(--admin-border-strong)]',
          open ? 'ring-2 ring-[var(--admin-primary)]' : '',
          'disabled:opacity-60',
        ].join(' ')}
      >
        <span
          className={
            selected
              ? 'flex-1 truncate text-[var(--admin-text)]'
              : 'flex-1 truncate text-[var(--admin-text-faint)]'
          }
        >
          {selected ? boothLabel(selected) : (placeholder ?? '주막을 선택하세요')}
        </span>
        <ChevronDown
          size={16}
          className={[
            'shrink-0 text-[var(--admin-text-faint)] transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] py-1 shadow-xl"
        >
          {booths.length === 0 ? (
            <p className="px-3.5 py-3 text-center text-[14px] text-[var(--admin-text-faint)]">
              등록된 주막이 없습니다
            </p>
          ) : (
            booths.map((booth) => {
              const isSelected = String(booth.boothId) === value;
              return (
                <button
                  key={booth.boothId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-active={isSelected}
                  onClick={() => {
                    onChange(String(booth.boothId));
                    setOpen(false);
                  }}
                  className={[
                    'flex w-full items-center gap-2 px-3.5 py-3 text-left text-[15px] transition-colors active:bg-[var(--admin-primary-soft)]',
                    isSelected
                      ? 'bg-[var(--admin-primary-soft)] font-semibold text-[var(--admin-primary)]'
                      : 'text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]',
                  ].join(' ')}
                >
                  <span className="min-w-0 flex-1 truncate">{boothLabel(booth)}</span>
                  {isSelected && (
                    <Check size={16} className="shrink-0 text-[var(--admin-primary)]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
