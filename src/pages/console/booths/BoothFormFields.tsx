import { Card, Field, ImageUploadField, Input, MapLocationPicker } from '@/components/admin/ui';

export interface BoothFormState {
  name: string;
  department: string;
  location: string;
  xRatio: number | null;
  yRatio: number | null;
  menuBoardImageUrl: string;
}

interface BoothFormFieldsProps {
  form: BoothFormState;
  onChange: (patch: Partial<BoothFormState>) => void;
  nameRequired?: boolean;
}

export default function BoothFormFields({
  form,
  onChange,
  nameRequired = false,
}: BoothFormFieldsProps) {
  return (
    <>
      <Card padding="md">
        <h2 className="mb-4 text-base font-semibold text-[var(--admin-text)]">기본 정보</h2>
        <div className="flex flex-col gap-4">
          <Field label="부스 이름" required={nameRequired} htmlFor="booth-name">
            <Input
              id="booth-name"
              type="text"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              maxLength={100}
              required={nameRequired}
              placeholder="예: 컴퓨터학부 주막"
            />
          </Field>

          <Field label="학과/단체" htmlFor="booth-department">
            <Input
              id="booth-department"
              type="text"
              value={form.department}
              onChange={(e) => onChange({ department: e.target.value })}
              maxLength={100}
              placeholder="예: 컴퓨터학부"
            />
          </Field>

          <Field label="위치 텍스트" hint="예: IT대학 2호관 앞" htmlFor="booth-location">
            <Input
              id="booth-location"
              type="text"
              value={form.location}
              onChange={(e) => onChange({ location: e.target.value })}
              maxLength={200}
            />
          </Field>

          <ImageUploadField
            label="메뉴판 이미지"
            hint="부스당 1장"
            value={form.menuBoardImageUrl}
            onChange={(next) => onChange({ menuBoardImageUrl: next })}
            emptyMessage="메뉴판 사진을 업로드하세요."
            previewClassName="max-h-72 w-full max-w-sm object-contain"
          />
        </div>
      </Card>

      <Card padding="md">
        <h2 className="mb-3 text-base font-semibold text-[var(--admin-text)]">지도 위치</h2>
        <MapLocationPicker
          xRatio={form.xRatio}
          yRatio={form.yRatio}
          onChange={(x, y) => onChange({ xRatio: x, yRatio: y })}
        />
      </Card>
    </>
  );
}
