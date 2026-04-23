import React from 'react';
import { CriterionType } from '../../types';

const STEP_LABELS: Record<string, string> = {
  [CriterionType.ETHICS]: 'Đạo đức tốt',
  [CriterionType.ACADEMIC]: 'Học tập tốt',
  [CriterionType.PHYSICAL]: 'Thể lực tốt',
  [CriterionType.VOLUNTEER]: 'Tình nguyện tốt',
  [CriterionType.INTEGRATION]: 'Hội nhập tốt',
  'SUBMIT': 'Gửi hồ sơ',
};

interface StudentStepProgressProps {
  steps: string[];
  currentStepIdx: number;
  catStatus: Record<string, boolean>;
  allHardMet: boolean;
  onStepClick: (idx: number) => void;
}

const StudentStepProgress: React.FC<StudentStepProgressProps> = ({ steps, currentStepIdx, catStatus, allHardMet, onStepClick }) => {
  return (
    <div className="flex items-center gap-1.5 mt-6 overflow-x-auto pb-2 scrollbar-none">
      {steps.map((s, idx) => {
        const isCat = s !== 'SUBMIT';
        const isMet = isCat ? catStatus[s as string] : allHardMet;
        const isActive = idx === currentStepIdx;

        return (
          <div key={idx} className="flex items-center gap-1.5">
            <button
              onClick={() => onStepClick(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                ${isActive
                  ? (isMet ? 'bg-green-600 text-white' : 'bg-red-600 text-white')
                  : (isMet ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100')
                }`}
            >
              {isMet ? <i className="fas fa-check-circle text-[8px]"></i> : <i className="fas fa-exclamation-circle text-[8px]"></i>}
              <span className="hidden sm:inline">{STEP_LABELS[s] || s}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`w-3 h-0.5 ${isMet ? 'bg-green-300' : 'bg-gray-200'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudentStepProgress;
