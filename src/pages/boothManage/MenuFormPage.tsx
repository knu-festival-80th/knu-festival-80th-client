import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, imageUrlToPath, menuApi } from '@/apis';
import type { MenuCreateRequest, MenuItem, MenuUpdateRequest } from '@/apis';
import { Button, Card, Field, ImageUploadField, Input, Textarea } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

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
    imageUrl: imageUrlToPath(menu.imageUrl),
    description: menu.description ?? '',
  };
}

export default function MenuFormPage() {
  const boothId = useAuthStore((s) => s.boothId);
  const { menuId: menuIdParam } = useParams<{ menuId?: string }>();
  const menuId = menuIdParam ? Number(menuIdParam) : null;
  const isEdit = menuId !== null;

  const menusQuery = useQuery({
    queryKey: ['admin', 'booth', boothId, 'menus'],
    queryFn: () => menuApi.listMenus(boothId as number),
    enabled: isEdit && boothId !== null && Number.isInteger(boothId) && boothId > 0,
  });

  if (boothId === null) return null;

  if (isEdit && menusQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-md bg-[var(--admin-surface-hover)]" />;
  }
  if (isEdit && menusQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
      >
        {menusQuery.error instanceof ApiClientError
          ? menusQuery.error.message
          : '메뉴를 불러오지 못했습니다.'}
      </div>
    );
  }

  if (isEdit) {
    const menu = menusQuery.data?.find((m) => m.menuId === menuId);
    if (!menu) {
      return (
        <p className="text-sm text-[var(--admin-text-muted)]">해당 메뉴를 찾을 수 없습니다.</p>
      );
    }
    return (
      <MenuForm
        key={menu.menuId}
        boothId={boothId}
        menuId={menu.menuId}
        menuName={menu.name}
        initial={toFormState(menu)}
      />
    );
  }

  return <MenuForm boothId={boothId} menuId={null} menuName={null} initial={EMPTY} />;
}

interface MenuFormProps {
  boothId: number;
  menuId: number | null;
  menuName: string | null;
  initial: FormState;
}

function MenuForm({ boothId, menuId, menuName, initial }: MenuFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = menuId !== null;

  const [form, setForm] = useState<FormState>(initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: MenuCreateRequest) => menuApi.createMenu(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'menus'] });
      navigate('/booth/manage/menus', { replace: true });
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
      navigate('/booth/manage/menus', { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '메뉴 수정에 실패했습니다.',
      );
    },
  });

  const handleChange =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
    <div className="flex flex-col gap-3">
      <Link
        to="/booth/manage/menus"
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
      >
        <ArrowLeft size={14} />
        메뉴 목록
      </Link>

      <div className="flex flex-col gap-0.5">
        <h1 className="mt-3 text-xl font-semibold text-[var(--admin-text)]">
          {isEdit ? '메뉴 수정' : '신규 메뉴'}
        </h1>
        {isEdit && menuName && <p className="text-sm text-[var(--admin-text-muted)]">{menuName}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Card padding="md">
          <div className="flex flex-col gap-4">
            {errorMessage && (
              <div
                role="alert"
                className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
              >
                {errorMessage}
              </div>
            )}

            <Field label="메뉴 이름" required htmlFor="menu-name">
              <Input
                id="menu-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                maxLength={100}
                required
                placeholder="예: 김치전"
              />
            </Field>

            <Field label="가격" required htmlFor="menu-price">
              <div className="relative">
                <Input
                  id="menu-price"
                  type="number"
                  inputMode="numeric"
                  numericMono
                  min={0}
                  value={form.price}
                  onChange={handleChange('price')}
                  required
                  placeholder="0"
                  className="pr-10"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--admin-text-muted)]">
                  원
                </span>
              </div>
            </Field>

            <ImageUploadField
              label="메뉴 이미지"
              value={form.imageUrl}
              onChange={(next) => setForm((prev) => ({ ...prev, imageUrl: next }))}
              emptyMessage="메뉴 사진을 업로드하세요."
            />

            <Field label="설명" htmlFor="menu-description">
              <Textarea
                id="menu-description"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="짧고 군침 도는 한 줄이 잘 팔립니다."
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" size="lg" block disabled={isPending}>
            {isPending ? '저장 중…' : '저장'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate('/booth/manage/menus')}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
