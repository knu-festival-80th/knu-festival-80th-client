import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, menuApi } from '@/apis';
import type { MenuCreateRequest, MenuItem, MenuUpdateRequest } from '@/apis';

interface FormState {
  name: string;
  price: string;
  imageUrl: string;
  description: string;
}

const EMPTY: FormState = { name: '', price: '', imageUrl: '', description: '' };

function toFormState(menu: MenuItem): FormState {
  return {
    name: menu.name,
    price: String(menu.price),
    imageUrl: menu.imageUrl ?? '',
    description: menu.description ?? '',
  };
}

export default function MenuFormPage() {
  const { boothId: boothIdParam, menuId: menuIdParam } = useParams<{
    boothId: string;
    menuId?: string;
  }>();
  const boothId = Number(boothIdParam);
  const menuId = menuIdParam ? Number(menuIdParam) : null;
  const isEdit = menuId !== null;

  const menusQuery = useQuery({
    queryKey: ['admin', 'booth', boothId, 'menus'],
    queryFn: () => menuApi.listMenus(boothId),
    enabled: isEdit && Number.isInteger(boothId) && boothId > 0,
  });

  if (isEdit && menusQuery.isLoading) {
    return <p className="text-body2 text-text-muted">불러오는 중…</p>;
  }
  if (isEdit && menusQuery.isError) {
    return (
      <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">
        {menusQuery.error instanceof ApiClientError
          ? menusQuery.error.message
          : '메뉴를 불러오지 못했습니다.'}
      </p>
    );
  }

  if (isEdit) {
    const menu = menusQuery.data?.find((m) => m.menuId === menuId);
    if (!menu) {
      return <p className="text-body2 text-text-muted">해당 메뉴를 찾을 수 없습니다.</p>;
    }
    return (
      <MenuForm
        key={menu.menuId}
        boothId={boothId}
        menuId={menu.menuId}
        initial={toFormState(menu)}
      />
    );
  }

  return <MenuForm boothId={boothId} menuId={null} initial={EMPTY} />;
}

interface MenuFormProps {
  boothId: number;
  menuId: number | null;
  initial: FormState;
}

function MenuForm({ boothId, menuId, initial }: MenuFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = menuId !== null;

  const [form, setForm] = useState<FormState>(initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: MenuCreateRequest) => menuApi.createMenu(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'menus'] });
      navigate(`/admin/booth/${boothId}/menus`, { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '메뉴 등록에 실패했습니다.',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: MenuUpdateRequest) =>
      menuApi.updateMenu(boothId, menuId as number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'menus'] });
      navigate(`/admin/booth/${boothId}/menus`, { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '메뉴 수정에 실패했습니다.',
      );
    },
  });

  const handleChange =
    (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage('메뉴 이름은 필수입니다.');
      return;
    }
    const price = Number(form.price);
    if (!form.price.trim() || Number.isNaN(price) || price < 0) {
      setErrorMessage('가격은 0 이상의 숫자여야 합니다.');
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        name: form.name.trim() || undefined,
        price,
        imageUrl: form.imageUrl.trim() || undefined,
        description: form.description.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        name: form.name.trim(),
        price,
        imageUrl: form.imageUrl.trim() || undefined,
        description: form.description.trim() || undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-subheading font-semibold text-text">
        {isEdit ? '메뉴 수정' : '신규 메뉴 등록'}
      </h2>

      <Field label="메뉴 이름" required>
        <input
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          maxLength={100}
          required
        />
      </Field>

      <Field label="가격 (원)" required>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={form.price}
          onChange={handleChange('price')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          required
        />
      </Field>

      <Field label="이미지 URL">
        <input
          type="text"
          value={form.imageUrl}
          onChange={handleChange('imageUrl')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          maxLength={500}
        />
      </Field>

      <Field label="설명">
        <textarea
          value={form.description}
          onChange={handleChange('description')}
          className="min-h-20 rounded-md border border-border bg-surface px-3 py-2 text-body1"
        />
      </Field>

      {errorMessage && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-body1 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? '저장 중…' : isEdit ? '수정 저장' : '등록'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/booth/${boothId}/menus`)}
          className="rounded-md border border-border bg-surface px-4 py-2 text-body1 text-text"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-body2 text-text">
      <span>
        {label}
        {required && <span className="ml-1 text-knu-red">*</span>}
      </span>
      {children}
    </label>
  );
}
