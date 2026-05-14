import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Eye, Layers, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ApiClientError, canvasApi } from '@/apis';
import type { CanvasBoardSummary, CanvasPostit, CanvasQuestion } from '@/apis';
import RollingPaperSticker from '@/components/rollingPaper/RollingPaperSticker';
import { rollingPaperBoardFrames } from '@/components/rollingPaper/rollingPaperBoardAssets';
import {
  ROLLING_PAPER_STICKER_COLORS,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import {
  ROLLING_PAPER_CANVAS_DIMENSIONS,
  ROLLING_PAPER_NOTE_WIDTH,
  getRollingPaperFrameRect,
} from '@/lib/rollingPaperLayout';
import { Button, Card, Field, Input } from '@/components/admin/ui';

function colorIdFromBackend(colorId: number): RollingPaperStickerColorId {
  const idx = Math.min(Math.max(colorId - 1, 0), ROLLING_PAPER_STICKER_COLORS.length - 1);
  return ROLLING_PAPER_STICKER_COLORS[idx].id;
}

export default function CanvasAdminPage() {
  const queryClient = useQueryClient();
  const [pickedQuestionId, setPickedQuestionId] = useState<number | null>(null);
  const [pickedBoardId, setPickedBoardId] = useState<number | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [confirmDeletePostitId, setConfirmDeletePostitId] = useState<number | null>(null);

  const questionsQuery = useQuery({
    queryKey: ['admin', 'canvas', 'questions'],
    queryFn: canvasApi.listQuestions,
  });

  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);

  const selectedQuestionId =
    pickedQuestionId != null && questions.some((q) => q.questionId === pickedQuestionId)
      ? pickedQuestionId
      : (questions[0]?.questionId ?? null);

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.questionId === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  );

  const boardsQuery = useQuery({
    queryKey: ['admin', 'canvas', 'boards', selectedQuestionId],
    queryFn: () => canvasApi.listBoardSummaries(selectedQuestionId as number),
    enabled: selectedQuestionId != null,
  });

  const boards = useMemo(() => boardsQuery.data ?? [], [boardsQuery.data]);

  const selectedBoardId =
    pickedBoardId != null && boards.some((b) => b.boardId === pickedBoardId)
      ? pickedBoardId
      : (boards[0]?.boardId ?? null);

  const selectedBoard = useMemo(
    () => boards.find((b) => b.boardId === selectedBoardId) ?? null,
    [boards, selectedBoardId],
  );

  const postitsQuery = useQuery({
    queryKey: ['admin', 'canvas', 'postits', selectedBoardId],
    queryFn: () => canvasApi.listPostits(selectedBoardId as number),
    enabled: selectedBoardId != null,
  });

  const postits = postitsQuery.data ?? [];

  const createBoardMutation = useMutation({
    mutationFn: canvasApi.createBoard,
    onSuccess: (newBoardId) => {
      setErrorBanner(null);
      setSuccessBanner(`보드 #${newBoardId} 생성 완료`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'canvas', 'boards'] });
    },
    onError: (error: unknown) => {
      setSuccessBanner(null);
      setErrorBanner(error instanceof ApiClientError ? error.message : '보드 생성에 실패했습니다.');
    },
  });

  const deletePostitMutation = useMutation({
    mutationFn: canvasApi.deletePostit,
    onSuccess: () => {
      setErrorBanner(null);
      setSuccessBanner('포스트잇이 삭제되었습니다.');
      setConfirmDeletePostitId(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'canvas', 'postits'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'canvas', 'boards'] });
    },
    onError: (error: unknown) => {
      setSuccessBanner(null);
      setErrorBanner(error instanceof ApiClientError ? error.message : '삭제에 실패했습니다.');
    },
  });

  const confirmingPostit = confirmDeletePostitId
    ? postits.find((p) => p.canvasPostitId === confirmDeletePostitId)
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">롤링페이퍼</h1>
        <p className="text-sm text-[var(--admin-text-muted)]">
          사용자가 보는 보드를 그대로 미리보면서, 포스트잇을 클릭해 모니터링/삭제합니다.
        </p>
      </div>

      {successBanner && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-[var(--admin-success)]/30 bg-[var(--admin-success-soft)] px-3 py-2 text-sm text-[var(--admin-success)]"
        >
          <CheckCircle2 size={14} />
          <span>{successBanner}</span>
        </div>
      )}
      {errorBanner && <ErrorBanner message={errorBanner} />}

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: question + board picker */}
        <div className="flex flex-col gap-5">
          <QuestionPicker
            questions={questions}
            loading={questionsQuery.isLoading}
            error={questionsQuery.isError ? questionsQuery.error : null}
            selectedQuestionId={selectedQuestionId}
            onSelect={(id) => {
              setPickedQuestionId(id);
              setPickedBoardId(null);
            }}
          />

          {selectedQuestion && (
            <CreateBoardCard
              question={selectedQuestion}
              isPending={createBoardMutation.isPending}
              onCreate={(maxNoteCount) =>
                createBoardMutation.mutate({
                  questionId: selectedQuestion.questionId,
                  maxNoteCount,
                })
              }
            />
          )}

          {selectedQuestion && (
            <BoardsListCard
              boards={boards}
              loading={boardsQuery.isLoading}
              error={boardsQuery.isError ? boardsQuery.error : null}
              selectedBoardId={selectedBoardId}
              onSelect={setPickedBoardId}
            />
          )}
        </div>

        {/* Right: board preview = exact user view */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text-muted)]">
              <Eye size={12} /> 사용자에게 보이는 보드
            </div>
            {selectedBoard && (
              <div className="text-xs text-[var(--admin-text-muted)]">
                Board #{selectedBoard.boardId} · 변형 {selectedBoard.boardVariant} ·{' '}
                <span
                  className={
                    selectedBoard.noteCount >= selectedBoard.maxNoteCount
                      ? 'font-semibold text-[var(--admin-danger)]'
                      : 'tabular text-[var(--admin-text)]'
                  }
                >
                  {selectedBoard.noteCount}
                </span>
                <span className="text-[var(--admin-text-muted)]">
                  {' '}
                  / {selectedBoard.maxNoteCount}
                </span>
              </div>
            )}
          </div>

          {selectedBoard ? (
            <BoardPreviewCanvas
              board={selectedBoard}
              postits={postits}
              loading={postitsQuery.isLoading}
              error={postitsQuery.isError ? postitsQuery.error : null}
              onClickPostit={(id) => setConfirmDeletePostitId(id)}
            />
          ) : (
            <Card padding="lg">
              <p className="text-center text-sm text-[var(--admin-text-muted)]">
                왼쪽에서 보드를 선택하거나, 새 보드를 생성하세요.
              </p>
            </Card>
          )}
        </div>
      </div>

      {confirmingPostit && (
        <DeleteConfirmModal
          postit={confirmingPostit}
          onCancel={() => setConfirmDeletePostitId(null)}
          onConfirm={() => deletePostitMutation.mutate(confirmingPostit.canvasPostitId)}
          isPending={deletePostitMutation.isPending}
        />
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
    >
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}

interface QuestionPickerProps {
  questions: CanvasQuestion[];
  loading: boolean;
  error: unknown;
  selectedQuestionId: number | null;
  onSelect: (id: number) => void;
}

function QuestionPicker({
  questions,
  loading,
  error,
  selectedQuestionId,
  onSelect,
}: QuestionPickerProps) {
  return (
    <Card padding="md">
      <h2 className="mb-3 text-base font-semibold text-[var(--admin-text)]">문항</h2>
      {loading && <p className="text-sm text-[var(--admin-text-muted)]">불러오는 중...</p>}
      {error ? (
        <ErrorBanner
          message={error instanceof ApiClientError ? error.message : '문항을 불러오지 못했습니다.'}
        />
      ) : null}
      {!loading && questions.length === 0 && !error && (
        <p className="text-sm text-[var(--admin-text-muted)]">등록된 문항이 없습니다.</p>
      )}
      {questions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {questions.map((question) => {
            const active = question.questionId === selectedQuestionId;
            return (
              <li key={question.questionId}>
                <button
                  type="button"
                  onClick={() => onSelect(question.questionId)}
                  className={[
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]',
                  ].join(' ')}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={[
                        'font-medium',
                        active ? 'text-[var(--admin-primary)]' : 'text-[var(--admin-text)]',
                      ].join(' ')}
                    >
                      {question.content}
                    </p>
                    <span className="tabular shrink-0 text-[11px] text-[var(--admin-text-faint)]">
                      #{question.questionId}
                    </span>
                  </div>
                  {question.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--admin-text-muted)]">
                      {question.description}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

interface CreateBoardCardProps {
  question: CanvasQuestion;
  isPending: boolean;
  onCreate: (maxNoteCount: number) => void;
}

function CreateBoardCard({ question, isPending, onCreate }: CreateBoardCardProps) {
  const [maxNoteCount, setMaxNoteCount] = useState<number>(40);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!Number.isFinite(maxNoteCount) || maxNoteCount < 1) return;
    onCreate(maxNoteCount);
  };

  return (
    <Card padding="md">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
        <Plus size={16} />새 보드
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field
          label="최대 포스트잇 수"
          required
          hint={`"${question.content}"`}
          htmlFor="max-note-count"
        >
          <Input
            id="max-note-count"
            type="number"
            min={1}
            max={500}
            value={maxNoteCount}
            onChange={(event) => setMaxNoteCount(Number(event.target.value))}
            numericMono
          />
        </Field>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? '생성 중...' : '보드 생성'}
        </Button>
      </form>
    </Card>
  );
}

interface BoardsListCardProps {
  boards: CanvasBoardSummary[];
  loading: boolean;
  error: unknown;
  selectedBoardId: number | null;
  onSelect: (id: number) => void;
}

function BoardsListCard({
  boards,
  loading,
  error,
  selectedBoardId,
  onSelect,
}: BoardsListCardProps) {
  return (
    <Card padding="md">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
        <Layers size={16} />
        보드 목록
      </h2>
      {loading && <p className="text-sm text-[var(--admin-text-muted)]">불러오는 중...</p>}
      {error ? (
        <ErrorBanner
          message={error instanceof ApiClientError ? error.message : '보드를 불러오지 못했습니다.'}
        />
      ) : null}
      {!loading && boards.length === 0 && !error && (
        <p className="text-sm text-[var(--admin-text-muted)]">
          이 문항에는 아직 보드가 없습니다. 위에서 새 보드를 생성하세요.
        </p>
      )}
      {boards.length > 0 && (
        <ul className="flex flex-col gap-2">
          {boards.map((board) => {
            const active = board.boardId === selectedBoardId;
            const ratio = board.maxNoteCount > 0 ? board.noteCount / board.maxNoteCount : 0;
            const full = board.noteCount >= board.maxNoteCount;
            return (
              <li key={board.boardId}>
                <button
                  type="button"
                  onClick={() => onSelect(board.boardId)}
                  className={[
                    'flex w-full flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]',
                  ].join(' ')}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={[
                        'font-medium',
                        active ? 'text-[var(--admin-primary)]' : 'text-[var(--admin-text)]',
                      ].join(' ')}
                    >
                      Board #{board.boardId}
                    </span>
                    <span className="tabular text-[11px] text-[var(--admin-text-faint)]">
                      v{board.boardVariant}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 text-xs">
                    <span
                      className={[
                        'tabular font-semibold',
                        full ? 'text-[var(--admin-danger)]' : 'text-[var(--admin-text)]',
                      ].join(' ')}
                    >
                      {board.noteCount}
                    </span>
                    <span className="text-[var(--admin-text-muted)]">/ {board.maxNoteCount}</span>
                    {full && (
                      <span className="ml-auto rounded-full bg-[var(--admin-danger-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--admin-danger)]">
                        가득 참
                      </span>
                    )}
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[var(--admin-surface-hover)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ratio * 100).toFixed(0)}%`,
                        background: full ? 'var(--admin-danger)' : 'var(--admin-primary)',
                      }}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

interface BoardPreviewCanvasProps {
  board: CanvasBoardSummary;
  postits: CanvasPostit[];
  loading: boolean;
  error: unknown;
  onClickPostit: (postitId: number) => void;
}

function BoardPreviewCanvas({
  board,
  postits,
  loading,
  error,
  onClickPostit,
}: BoardPreviewCanvasProps) {
  const variant = board.boardVariant % rollingPaperBoardFrames.length;
  const frameImage = rollingPaperBoardFrames[variant];
  const frameRect = getRollingPaperFrameRect(variant);
  const { width: canvasW, height: canvasH } = ROLLING_PAPER_CANVAS_DIMENSIONS;

  return (
    <Card padding="none">
      <div className="relative w-full">
        {loading && (
          <div className="flex h-72 items-center justify-center">
            <p className="text-sm text-[var(--admin-text-muted)]">불러오는 중...</p>
          </div>
        )}
        {error ? (
          <div className="p-3">
            <ErrorBanner
              message={
                error instanceof ApiClientError ? error.message : '포스트잇을 불러오지 못했습니다.'
              }
            />
          </div>
        ) : null}

        {!loading && !error && (
          <div
            className="relative w-full overflow-hidden rounded-lg bg-[#f1f1f1]"
            style={{ aspectRatio: `${canvasW} / ${canvasH}` }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: `${canvasW}px`,
                height: `${canvasH}px`,
                transform: 'scale(var(--board-scale))',
              }}
              ref={(node) => {
                if (!node) return;
                const parent = node.parentElement;
                if (!parent) return;
                const apply = () => {
                  const scale = parent.clientWidth / canvasW;
                  node.style.setProperty('--board-scale', String(scale));
                  parent.style.height = `${canvasH * scale}px`;
                };
                apply();
                const ro = new ResizeObserver(apply);
                ro.observe(parent);
                return () => ro.disconnect();
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-[34px] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.1)]"
                style={{ width: `${canvasW}px`, height: `${canvasH}px` }}
              >
                <img
                  src={frameImage}
                  alt=""
                  className="absolute object-contain"
                  style={{
                    left: `${frameRect.x}px`,
                    top: `${frameRect.y}px`,
                    width: `${frameRect.width}px`,
                    height: `${frameRect.height}px`,
                  }}
                />

                {postits.map((postit) => (
                  <button
                    key={postit.canvasPostitId}
                    type="button"
                    aria-label={`포스트잇 삭제: ${postit.message}`}
                    onClick={() => onClickPostit(postit.canvasPostitId)}
                    className="group absolute block touch-manipulation border-0 bg-transparent p-0 text-left transition-[filter,transform] duration-150 hover:drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-danger)]/80"
                    style={{
                      width: `${ROLLING_PAPER_NOTE_WIDTH}px`,
                      left: `${postit.placement.x}%`,
                      top: `${postit.placement.y}%`,
                      transform: 'translate(-50%, -50%)',
                      transformOrigin: 'center center',
                    }}
                  >
                    <RollingPaperSticker
                      colorId={colorIdFromBackend(postit.colorId)}
                      message={postit.message}
                      className="w-full"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-md bg-[var(--admin-danger)]/0 transition-colors group-hover:bg-[var(--admin-danger)]/10" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-[var(--admin-border)] px-4 py-2.5 text-xs text-[var(--admin-text-muted)]">
          포스트잇을 클릭해 내용을 확인하고 삭제할 수 있습니다.
        </div>
      </div>
    </Card>
  );
}

interface DeleteConfirmModalProps {
  postit: CanvasPostit;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteConfirmModal({ postit, onCancel, onConfirm, isPending }: DeleteConfirmModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl bg-[var(--admin-surface)] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[var(--admin-border)] px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
            <MessageSquare size={16} />
            포스트잇 삭제
          </h3>
        </div>
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-24 shrink-0 [container-type:inline-size]">
              <RollingPaperSticker
                colorId={colorIdFromBackend(postit.colorId)}
                message={postit.message}
                className="w-full"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[11px] text-[var(--admin-text-faint)]">
                #{postit.canvasPostitId}
              </span>
              <p className="text-sm text-[var(--admin-text)] whitespace-pre-wrap break-words">
                {postit.message}
              </p>
              <span className="tabular text-[11px] text-[var(--admin-text-faint)]">
                {new Date(postit.createdAt).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--admin-text-muted)]">
            영구 삭제됩니다. 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface-hover)] px-5 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            취소
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            iconLeft={<Trash2 size={12} />}
          >
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>
    </div>
  );
}
