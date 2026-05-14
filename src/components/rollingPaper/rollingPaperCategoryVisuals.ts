import categoryBoothImage from '@/assets/rollingPaper/categories/category-booth.png';
import categoryCongratsImage from '@/assets/rollingPaper/categories/category-congrats.png';
import categoryFeedbackImage from '@/assets/rollingPaper/categories/category-feedback.png';
import categoryFriendsImage from '@/assets/rollingPaper/categories/category-friends.png';
import categoryMoodImage from '@/assets/rollingPaper/categories/category-mood.png';
import categoryPerformanceImage from '@/assets/rollingPaper/categories/category-performance.png';

export const ROLLING_PAPER_CATEGORY_VISUALS = [
  { image: categoryMoodImage, background: '#fff8df' },
  { image: categoryCongratsImage, background: '#fff2f2' },
  { image: categoryPerformanceImage, background: '#eafaf3' },
  { image: categoryBoothImage, background: '#fff3ea' },
  { image: categoryFriendsImage, background: '#f9f3fa' },
  { image: categoryFeedbackImage, background: '#eff8ff' },
] as const;

export function getRollingPaperCategoryVisual(index: number) {
  return ROLLING_PAPER_CATEGORY_VISUALS[index % ROLLING_PAPER_CATEGORY_VISUALS.length];
}
