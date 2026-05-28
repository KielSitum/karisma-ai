import React from 'react';

export default function CVSkillsCloud({ skills = [] }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="card-base p-5 md:p-6 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F0EFFE] text-[#5B4FE8] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.7l-6.2 4.2 2.4-7.2L2 9.2h7.6L12 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[#0F1226] text-base truncate">Skills Extracted by AI</p>
            <p className="text-xs text-[#9EA3BC] mt-1">Found based on your document content</p>
          </div>
        </div>
        <div className="bg-[#F8F9FE] border border-[#E8EAF2] px-4 py-2 rounded-xl flex items-center flex-shrink-0">
          <span className="text-sm font-bold text-[#5B4FE8]">{skills.length}</span>
          <span className="text-xs font-semibold text-[#5A5F7D] ml-1.5 uppercase tracking-wider">Identified</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="px-3.5 py-1.5 bg-[#F8F9FE] border border-[#E8EAF2] text-[#0F1226] text-sm font-medium rounded-lg hover:border-[#E4E1FD] hover:bg-[#F0EFFE] hover:text-[#5B4FE8] transition-colors duration-200 cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}